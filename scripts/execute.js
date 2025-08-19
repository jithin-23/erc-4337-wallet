const hre = require("hardhat");

const FACTORY_ADDRESS = "0x536c3bc0b0cB5cE1E45cb1554Abc3937869744F9";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xF601A99ee8580362b7f4C06ACAEDe1ce6737A3f4";

async function getSenderAddress(EntryPoint, AccountFactory, address0) {
  let initCode =
    FACTORY_ADDRESS +
    AccountFactory.interface
      .encodeFunctionData("createAccount", [address0])
      .slice(2);

  let sender;
  try {
    await EntryPoint.getSenderAddress(initCode);
  } catch (err) {
    sender = "0x" + err.data.slice(-40);
  }
  console.log("✅ Sender address prepared:", sender);

  const code = await hre.ethers.provider.getCode(sender);
  if (code !== "0x") {
    initCode = "0x";
    console.log("ℹ️ initCode set to 0x (contract already deployed)");
  }

  return { sender, initCode };
}

async function estimateUserOpGas(userOp) {
  try {
    const url =
      "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_estimateUserOperationGas",
        params: [userOp, EP_ADDRESS],
      }),
    });

    const { result } = await response.json();
    userOp.preVerificationGas = result.preVerificationGas;
    userOp.callGasLimit = result.callGasLimit;
    userOp.verificationGasLimit = result.verificationGasLimit;

    console.log("✅ Gas estimation complete:", result);
  } catch (error) {
    console.error("❌ Gas estimation failed:", error);
  }
}

async function getMaxPriorityFeePerGas(userOp) {
  try {
    const url =
      "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "rundler_maxPriorityFeePerGas",
        params: [],
      }),
    });

    const { result } = await response.json();
    userOp.maxPriorityFeePerGas = result;
    console.log("✅ maxPriorityFeePerGas fetched:", result);
  } catch (error) {
    console.error("❌ Failed to fetch maxPriorityFeePerGas:", error);
  }
}

async function sendUserOperation(userOp) {
  let opHash;
  try {
    const url =
      "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sendUserOperation",
        params: [userOp, EP_ADDRESS],
      }),
    });

    const { result } = await response.json();
    opHash = result;
    console.log("✅ UserOperation sent, opHash:", opHash);
  } catch (error) {
    console.error("❌ Sending UserOperation failed:", error);
  }
  return opHash;
}

async function waitForUserOp(opHash, providerUrl, interval = 5000, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(providerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getUserOperationByHash",
        params: [opHash],
      }),
    });

    const { result } = await response.json();
    if (result && result.transactionHash) {
      console.log("✅ UserOperation included in tx:", result.transactionHash);
      return result.transactionHash;
    }

    console.log(`⏳ Waiting for inclusion... attempt ${i + 1}`);
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Timed out waiting for UserOperation to be included");
}

async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
  const AccountFactory = await hre.ethers.getContractAt("AccountFactory", FACTORY_ADDRESS);
  const Account = await hre.ethers.getContractFactory("Account");

  const address0 = await signer0.getAddress();
  const { sender, initCode } = await getSenderAddress(EntryPoint, AccountFactory, address0);

  const nonce = "0x" + (await EntryPoint.getNonce(sender, 0)).toString(16);
  const callData = Account.interface.encodeFunctionData("execute");

  const userOp = {
    sender,
    nonce,
    initCode,
    callData,
    paymasterAndData: PM_ADDRESS,
    signature:
      "0xe10b6fe416a143933a05eee0653eafff4ed68d19cbc0c271e80e79cb3073de5f178cfd507e6c2218d81637d22215229bfd4f77c90531a0af327b6ce72871407e1c",
  };
  console.log("📝 Base UserOp constructed:", userOp);

  await estimateUserOpGas(userOp);
  await getMaxPriorityFeePerGas(userOp);

  const { maxFeePerGas } = await hre.ethers.provider.getFeeData();
  userOp.maxFeePerGas = "0x" + (maxFeePerGas * 3n).toString(16);
  console.log("✅ maxFeePerGas set:", userOp.maxFeePerGas);

  const userOpHash = await EntryPoint.getUserOpHash(userOp);
  userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));
  console.log("✅ UserOp signed:", userOp.signature);

  const opHash = await sendUserOperation(userOp);

  const txHash = await waitForUserOp(opHash, "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_API_KEY);
  console.log("🎉 Final txHash:", txHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
