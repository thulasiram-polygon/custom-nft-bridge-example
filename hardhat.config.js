require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");

/*
 * You need to export an object to set up your config
 * Go to https://hardhat.org/config/ to learn more
 */

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.6.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.5.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.4.19",
        settings: {
          optimizer: {
            enabled: false,
          },
        },
      },
    ],
  },
  networks: {
    rootChain: {
      url: process.env.ROOTCHAIN_URL,
      accounts: [process.env.PRIVATE_KEY_ROOTCHAIN],
    },
    childChain: {
      url: process.env.CHILDCHAIN_URL,
      accounts: [process.env.PRIVATE_KEY_CHILDCHAIN],
    },
  },
};
