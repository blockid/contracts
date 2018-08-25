const { Network, NetworkProvider } = require('blockid');

module.exports = new Network(new NetworkProvider(process.env.TEST_ENDPOINT));
