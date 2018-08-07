const bip39 = require("bip39");
const hdKey = require('ethereumjs-wallet/hdkey');

const HD_PATH = 'm/44\'/60\'/0\'/0/';
const ACCOUNTS_COUNT = 10;

const wallets = [];

const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(process.env.TEST_MNEMONIC));

for (let i = 0; i < ACCOUNTS_COUNT; i++) {
  const wallet = hdWallet.derivePath(HD_PATH + i).getWallet();
  const address = '0x' + wallet.getAddress().toString('hex').toLowerCase();
  const privateKey = wallet.getPrivateKey();

  wallets.push({
    address,
    privateKey,
  });
}

function getPrivateKey(index) {
  let wallet = null;

  switch (typeof index) {
    case 'number':
      wallet = wallets[index];
      break;
    case 'string':
      index = index.toLowerCase();
      wallet = wallets.find(({ address }) => address === index);
      break;
  }

  return wallet ? wallet.privateKey : null;
}

module.exports = {
  getPrivateKey,
};
