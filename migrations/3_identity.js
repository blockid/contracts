const { getNameHash } = require('../utils/ens');

const AddressLib = artifacts.require('AddressLib.sol');
const AddressArrayLib = artifacts.require('AddressArrayLib.sol');
const SignatureLib = artifacts.require('SignatureLib.sol');

const AbstractENS = artifacts.require('AbstractENS.sol');
const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const IdentityRegistry = artifacts.require('IdentityRegistry.sol');

module.exports = function(deployer) {
  const ensNameHash = getNameHash("blockid.eth");

  const ens = process.env.PROD_ENS
    ? AbstractENS.at(process.env.PROD_ENS)
    : AbstractENS.at(ENSMock.address);

  deployer.deploy(AddressLib);
  deployer.deploy(AddressArrayLib);
  deployer.deploy(SignatureLib);

  deployer.link(AddressLib, IdentityRegistry);
  deployer.link(AddressArrayLib, IdentityRegistry);
  deployer.link(SignatureLib, IdentityRegistry);

  deployer.link(AddressLib, Identity);
  deployer.link(AddressArrayLib, Identity);
  deployer.link(SignatureLib, Identity);

  deployer
    .deploy(Identity)
    .then(async (identity) => {
      const registry = await deployer.deploy(IdentityRegistry, ens.address, ENSResolver.address, identity.address);

      await identity.addFirstMember(identity.address);
      await ens.setOwner(ensNameHash, registry.address);
      await registry.addEnsRootNode(ensNameHash);
    });
};
