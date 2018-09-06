const {
  normalizeEnsName,
  getEnsNameHash,
  getEnsLabelHash,
} = require('blockid');

const AddressLib = artifacts.require('AddressLib.sol');
const AddressArrayLib = artifacts.require('AddressArrayLib.sol');
const SignatureLib = artifacts.require('SignatureLib.sol');
const AbstractENS = artifacts.require('AbstractENS.sol');
const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const Registry = artifacts.require('Registry.sol');

module.exports = function(deployer, network) {
  deployer.then(async () => {

    // linking
    deployer.link(AddressLib, Registry);
    deployer.link(AddressArrayLib, Registry);
    deployer.link(SignatureLib, Registry);

    let ens;

    switch (network) {
      case 'prod':
        ens = AbstractENS.at(process.env.PROD_ENS_ADDRESS);
        break;

      case 'test':
        ens = AbstractENS.at(ENSMock.address);
        break;
    }

    const registry = await deployer.deploy(
      Registry,
      ens.address,
      ENSResolver.address,
      Identity.address
    );

    switch (network) {
      case 'prod': {
        const labels = (process.env.PROD_ENS_LABELS || '')
          .split(',')
          .map(label => label.trim())
          .filter(label => !!label);

        for (const label of labels) {
          const name = normalizeEnsName(label, process.env.PROD_ENS_ROOT_NODE)
          const nameHash = getEnsNameHash(name);

          await ens.setOwner(nameHash, registry.address);
          await registry.addEnsRootNode(nameHash);

          // creating admin identity
          await registry.createSelfIdentity(getEnsLabelHash('admin'), nameHash)
        }
        break;
      }

      case 'test': {
        const nameHashes = [
          getEnsNameHash('blockid.test'),
          getEnsNameHash('demo.test'),
          getEnsNameHash('example.test'),
        ];

        for (const nameHash of nameHashes) {
          await ens.setOwner(nameHash, registry.address);
          await registry.addEnsRootNode(nameHash);

          // creating admin identity
          await registry.createSelfIdentity(getEnsLabelHash('admin'), nameHash);
        }
        break;
      }
    }
  });
};
