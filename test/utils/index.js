const { getEnsNameInfo } = require('eth-utils');

let counter = Date.now();

function getRandomEnsNameInfo() {
  const name = `${(++counter).toString(16)}.blockid.test`;
  return getEnsNameInfo(name);
}

module.exports = {
  getRandomEnsNameInfo,
};
