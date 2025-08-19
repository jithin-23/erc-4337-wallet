const hre = require("hardhat");

const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ACCOUNT_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS);
  const count = await account.count();
  console.log(count);

  console.log("Account balance: ",await hre.ethers.provider.getBalance(ACCOUNT_ADDRESS));
  const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
  console.log("Account balance on EntryPoint: ", await EntryPoint.balanceOf(ACCOUNT_ADDRESS));
  console.log("Paymaster balance on EntryPoint: ", await EntryPoint.balanceOf(PM_ADDRESS));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
