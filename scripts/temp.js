const hre = require("hardhat");

async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const signature = await signer0.signMessage(
    hre.ethers.getBytes(hre.ethers.id("wee"))
  );
  console.log({signature})
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
