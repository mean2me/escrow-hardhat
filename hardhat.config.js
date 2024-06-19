const path = require('node:path')
require('dotenv').config({
  path: path.resolve(`${__dirname}/.env`),
  override: true,
})
require('@nomicfoundation/hardhat-toolbox')

module.exports = {
  solidity: '0.8.17',
  paths: {
    artifacts: './app/src/artifacts',
  },
  networks: {
    // sepolia: {
    //   url: process.env.ALCHEMY_TESTNET_RPC_URL,
    //   accounts: [`${process.env.TESTNET_PRIVATE_KEY}`],
    // },
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 5000, // Mine a block every 5 seconds
      },
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
}
