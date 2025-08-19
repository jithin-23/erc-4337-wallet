const hre = require("hardhat");

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
  const AccountFactory = await hre.ethers.getContractAt(
    "AccountFactory",
    FACTORY_ADDRESS
  );
  const Account = await hre.ethers.getContractFactory("Account");

  //CREATE: hash(sender + nonce).   where sender is the deployer. we are gonna use CREATE1
  //CREATE2: hash(0xFF + sender + bytecode + salt)
  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE,
  });

  const address0 = await signer0.getAddress();
  console.log({sender});

  // const initCode =
  //   FACTORY_ADDRESS +
  //   AccountFactory.interface
  //     .encodeFunctionData("createAccount", [address0])
  //     .slice(2);
  const initCode = "0x";

  const userOp = {
    sender,
    nonce: await EntryPoint.getNonce(sender, 0),
    initCode,
    callData: Account.interface.encodeFunctionData("execute"),
    callGasLimit: 200000,
    verificationGasLimit: 200000,
    preVerificationGas: 50000,
    maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
    paymasterAndData: PM_ADDRESS,
    signature: "0x",
  };

  // await EntryPoint.depositTo(PM_ADDRESS, {
  //   value: hre.ethers.parseEther("100"),
  // });

  const tx = await EntryPoint.handleOps([userOp], address0);
  const receipt = await tx.wait();
  console.log(receipt);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
