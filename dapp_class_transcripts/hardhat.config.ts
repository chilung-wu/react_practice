// import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox-viem";

// const config: HardhatUserConfig = {
//   solidity: "0.8.20",
// };

// export default config;

import "@nomicfoundation/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      // url: "https://rpc.sepolia.org", // Sepolia RPC URL
      accounts: process.env.SEPOLIA_PRIVATE_KEY !== undefined ? [`0x${process.env.SEPOLIA_PRIVATE_KEY}`] : [],
    },
  },
};

export default config;
