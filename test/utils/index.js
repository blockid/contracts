const { getEnsNameInfo, sha3 } = require('eth-utils');

let counter = Date.now();

function getRandomEnsNameInfo() {
  const name = `${(++counter).toString(16)}.blockid.test`;
  return getEnsNameInfo(name);
}

function getMethodSignature(name, ...args) {
  return sha3(`${name}(${args.join(",")})`).slice(0, 4);
}

module.exports = {
  getRandomEnsNameInfo,
  getMethodSignature,
};
