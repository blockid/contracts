const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");

module.exports = {
  networks: {
    test: {
      provider: new Web3.providers.HttpProvider(process.env.TEST_ENDPOINT),
      network_id: 100,
    },
    prod: {
      provider: function() {
        return new HDWalletProvider(
          process.env.PROD_MNEMONIC,
          process.env.PROD_ENDPOINT,
        );
      },
      network_id: 4,
      gas: 6000000,
    },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
};
