const AddressLib = artifacts.require('AddressLib.sol');
const AddressArrayLib = artifacts.require('AddressArrayLib.sol');
const SignatureLib = artifacts.require('SignatureLib.sol');
const Identity = artifacts.require('Identity.sol');

module.exports = function(deployer) {
  deployer.then(async () => {

    // linking
    deployer.link(AddressLib, Identity);
    deployer.link(AddressArrayLib, Identity);
    deployer.link(SignatureLib, Identity);

    const identity = await deployer.deploy(Identity);
    await identity.addFirstMember(identity.address);
  });
};
