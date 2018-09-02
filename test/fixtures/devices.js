const bip39 = require('bip39');
const hdKey = require('ethereumjs-wallet/hdkey');
const { Device, anyToBuffer } = require('blockid');

const HD_PATH = 'm/44\'/60\'/0\'/0/';
const ACCOUNTS_COUNT = 10;

const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(process.env.TEST_MNEMONIC));
const devices = [];

for (let i = 0; i < ACCOUNTS_COUNT; i++) {
  const wallet = hdWallet.derivePath(HD_PATH + i).getWallet();
  devices.push(new Device(null, {
      privateKey: anyToBuffer(wallet.getPrivateKey(), {
        autoStringDetect: true,
      }),
    }),
  );
}

module.exports = devices;
