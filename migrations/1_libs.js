const AddressLib = artifacts.require('AddressLib.sol');
const AddressArrayLib = artifacts.require('AddressArrayLib.sol');
const SignatureLib = artifacts.require('SignatureLib.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(AddressLib);
    await deployer.deploy(AddressArrayLib);
    await deployer.deploy(SignatureLib);
  });
};
