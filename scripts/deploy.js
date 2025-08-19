const hre = require("hardhat");

async function deploy() {
  const AF = await hre.ethers.getContractFactory("AccountFactory");
  const af = await AF.deploy();
  console.log("Account Factory deployed at:", await af.getAddress());

  const EP = await hre.ethers.getContractFactory("EntryPoint");
  const ep = await EP.deploy();
  console.log("EntryPoint deployed at:", await ep.getAddress());

  const PM = await hre.ethers.getContractFactory("Paymaster");
  const pm = await PM.deploy();
  console.log("Paymaster deployed at:", await pm.getAddress());
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
