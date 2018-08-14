const { getNameHash } = require('../utils/ens');

const AddressLib = artifacts.require('AddressLib.sol');
const AddressArrayLib = artifacts.require('AddressArrayLib.sol');
const SignatureLib = artifacts.require('SignatureLib.sol');

const AbstractENS = artifacts.require('AbstractENS.sol');
const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const IdentityRegistry = artifacts.require('IdentityRegistry.sol');

module.exports = function(deployer, network) {
  deployer.then(async () => {
    let ens;
    let ensDomainHash;

    switch (network) {
      case 'prod':
        ens = AbstractENS.at(process.env.PROD_ENS_ADDRESS);
        ensDomainHash = getNameHash(process.env.PROD_ENS_DOMAIN);
        break;

      case 'test':
        ens = AbstractENS.at(ENSMock.address);
        ensDomainHash = getNameHash('blockid.test');
        break;
    }

    await deployer.deploy(AddressLib);
    await deployer.deploy(AddressArrayLib);
    await deployer.deploy(SignatureLib);

    deployer.link(AddressLib, IdentityRegistry);
    deployer.link(AddressArrayLib, IdentityRegistry);
    deployer.link(SignatureLib, IdentityRegistry);

    deployer.link(AddressLib, Identity);
    deployer.link(AddressArrayLib, Identity);
    deployer.link(SignatureLib, Identity);

    const identity = await deployer.deploy(Identity);
    const identityRegistry = await deployer.deploy(
      IdentityRegistry,
      ens.address,
      ENSResolver.address,
      identity.address
    );

    await identity.addFirstMember(identity.address);
    await ens.setOwner(ensDomainHash, identityRegistry.address);
    await identityRegistry.addEnsRootNode(ensDomainHash);
  });
};
