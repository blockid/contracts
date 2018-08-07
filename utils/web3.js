const Web3 = require('web3');

if (!global.web3) {
  global.web3 = new Web3(new Web3.providers.HttpProvider(process.env.TEST_ENDPOINT));
}

function sha3(data, options = null) {
  return web3.sha3(data, options);
}

function getBalance(target) {
  const address = target.address ? target.address : target;
  return new Promise((resolve, reject) => web3.eth.getBalance(address, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  }));
}

function getGasPrice() {
  return new Promise((resolve, reject) => web3.eth.getGasPrice((err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result.toNumber());
    }
  }));
}

function ethToWei(value) {
  return parseInt(web3.toWei(value, "ether"), 10);
}

module.exports = {
  sha3,
  getBalance,
  getGasPrice,
  ethToWei,
};
