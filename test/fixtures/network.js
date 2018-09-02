const { Network } = require('blockid');

module.exports = new Network({
  providerEndpoint: process.env.TEST_ENDPOINT,
});
