const nameHash = require('eth-ens-namehash');
const { sha3 } = require('./web3');

function getNameHash(name) {
  return nameHash.hash(name);
}

function getLabelHash(name) {
  const [label] = name.split('.');
  return sha3(label);
}

module.exports = {
  getNameHash,
  getLabelHash,
};
