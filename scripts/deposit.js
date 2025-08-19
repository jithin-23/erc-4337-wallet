const hre = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xF601A99ee8580362b7f4C06ACAEDe1ce6737A3f4";

async function main() {
  const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  await EntryPoint.depositTo(PM_ADDRESS, {
    value: hre.ethers.parseEther(".01"),
  });

  console.log("Deposit was succesful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
