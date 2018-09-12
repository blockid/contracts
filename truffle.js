const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    test: {
      host: "localhost",
      port: 8545,
      network_id: "1000",
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
  },
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
      },
    },
  },
};
