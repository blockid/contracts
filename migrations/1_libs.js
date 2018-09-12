const AddressLib = artifacts.require('AddressLib');
const AddressArrayLib = artifacts.require('AddressArrayLib');
const SignatureLib = artifacts.require('SignatureLib');

module.exports = async (deployer) => {
  await deployer.deploy(AddressLib);
  await deployer.deploy(AddressArrayLib);
  await deployer.deploy(SignatureLib);
};
