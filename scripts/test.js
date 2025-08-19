const hre = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const ACCOUNT_ADDRESS = "0xe12f6d0e098ffd895104b1aebc944e2228ea8ca2";
const PM_ADDRESS = "0xF601A99ee8580362b7f4C06ACAEDe1ce6737A3f4";

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
