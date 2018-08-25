const { NetworkProvider } = require("blockid");
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    test: {
      provider: function() {
        return new NetworkProvider(process.env.TEST_ENDPOINT);
      },
      network_id: "1000",
      gas: 6200000,
    },
    prod: {
      provider: function() {
        return new HDWalletProvider(
          process.env.PROD_MNEMONIC,
          process.env.PROD_ENDPOINT,
        );
      },
      network_id: 4,
      gas: 6200000,
    },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
};
