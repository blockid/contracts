const { sign } = require('secp256k1');
const { hashPersonalMessage } = require('blockid-core');
const { sha3 } = require('./web3');
const { getPrivateKey } = require('./accounts');

function getMethodSignature(methodName, ...argTypes) {
  return sha3(`${methodName}(${argTypes.join(',')})`).slice(0, 10);
}

function getMessageSignature(account, ...args) {
  const privateKey = getPrivateKey(account);
  const data = `0x${args.map((arg) => {
    switch (typeof arg) {
      case 'number':
        arg = arg.toString(16);
        arg = `${('0').repeat(64 - arg.length)}${arg}`; // uint256
        break;
      case 'boolean':
        arg = arg ? '01' : '00'; // bool
        break;
    }

    if (typeof arg === 'string') {
      if (arg.startsWith('0x')) {
        arg = arg.slice(2);
      }
    } else {
      arg = '';
    }

    return arg;
  }).join('')}`;

  const hash = hashPersonalMessage(data);
  const { signature, recovery } = sign(hash, privateKey);
  return `0x${Buffer.from([...signature, recovery + 27]).toString('hex')}`;
}

module.exports = {
  getMethodSignature,
  getMessageSignature,
};
