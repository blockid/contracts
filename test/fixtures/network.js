const { Network } = require('blockid');

module.exports = Network.create({
  providerEndpoint: process.env.TEST_ENDPOINT,
});
