import { ethers } from "hardhat";
// import * as dotenv from "dotenv";

// dotenv.config();
require('dotenv').config();

const ADDRESS = process.env.DEPLOY_ADDRESS;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ContractFactory = await ethers.getContractFactory("Transcript");
  const contract = await ContractFactory.deploy(ADDRESS);

  // 確保合約已經部署
  // await contract.waitForDeployment();

  console.log("Transcript contract deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
