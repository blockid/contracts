const { signPersonalMessage, prepareAddress } = require('eth-utils');
const { keyPairs, ensNamesInfo } = require('./constants');

function getPersonalMessageSignature(message, account, network = 'test') {
  let result = null;

  account = prepareAddress(account);

  if (keyPairs[network] && keyPairs[network][account]) {
    const { privateKey } = keyPairs[network][account];

    result = signPersonalMessage(message, privateKey);
  }

  return result;
}

function getEnsNamesInfo(network = 'test') {
  return ensNamesInfo[network] || [];
}

module.exports = {
  getPersonalMessageSignature,
  getEnsNamesInfo,
}
