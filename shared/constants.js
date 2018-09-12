const { anyToBuffer, normalizeEnsName, getEnsNameInfo, anyToHex } = require('eth-utils');
const bip39 = require('bip39');
const hdKey = require('ethereumjs-wallet/hdkey');

const HD_PATH = 'm/44\'/60\'/0\'/0/';

function createEnsNamesInfo(network) {
  let result = [];

  switch (network) {
    case 'prod':
      const labels = (process.env.PROD_ENS_LABELS || '').trim();
      const rootNode = (process.env.PROD_ENS_ROOT_NODE || "").trim();

      if (labels && rootNode) {
        result = labels
          .split(',')
          .map(label => label.trim())
          .map(label => normalizeEnsName(label, rootNode))
          .filter(label => !!label)
          .map(name => getEnsNameInfo(name));
      }
      break;

    case 'test':
      result = [
        'blockid',
        'superdeluxe',
        'example',
      ].map(label => getEnsNameInfo(label, 'test'));
      break;

    default:
      throw new Error('Unsupported network');
  }

  return result;
}

function createKeyPairs(mnemonic, count = 10) {
  const result = {};

  if (mnemonic) {
    const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

    for (let i = 0; i < count; i++) {
      const wallet = hdWallet.derivePath(HD_PATH + i).getWallet();

      const publicKey = anyToBuffer(wallet.getPublicKey(), {
        autoStringDetect: true,
      });

      const privateKey = anyToBuffer(wallet.getPrivateKey(), {
        autoStringDetect: true,
      });

      const address = anyToHex(wallet.getAddress(), {
        add0x: true,
      });

      result[address] = {
        publicKey,
        privateKey,
      };
    }
  }

  return result;
}

const keyPairs = {
  test: createKeyPairs(process.env.TEST_MNEMONIC),
  prod: createKeyPairs(process.env.PROD_MNEMONIC),
};

const ensNamesInfo = {
  test: createEnsNamesInfo('test'),
  prod: createEnsNamesInfo('prod'),
};

module.exports = {
  keyPairs,
  ensNamesInfo,
};
