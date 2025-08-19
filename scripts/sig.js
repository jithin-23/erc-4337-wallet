const hre = require("hardhat");

const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ACCOUNT_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const signature = signer0.signMessage(
    hre.ethers.getBytes(hre.ethers.id("wee"))
  );

  const Test = await hre.ethers.getContractFactory("Test");
  const test = await Test.deploy(signature);
  await test.waitForDeployment();

  console.log("address0: ", await signer0.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
