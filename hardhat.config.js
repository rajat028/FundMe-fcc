require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
require("dotenv").config()
require("hardhat-deploy")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY
const COIN_MARKET_CAP_API_KEY = process.env.COIN_MARKET_CAP_API_KEY

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.18" },
      { version: "0.6.0" },
      { version: "0.8.0" },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: ETHER_SCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: COIN_MARKET_CAP_API_KEY,
    token: "MATIC",
  },
};
 