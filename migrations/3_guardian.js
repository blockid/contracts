const AddressLib = artifacts.require('AddressLib');
const AddressArrayLib = artifacts.require('AddressArrayLib');
const SignatureLib = artifacts.require('SignatureLib');
const Guardian = artifacts.require('SharedAccount');

module.exports = async (deployer, network, accounts) => {

  // linking
  deployer.link(AddressLib, Guardian);
  deployer.link(AddressArrayLib, Guardian);
  deployer.link(SignatureLib, Guardian);

  await deployer.deploy(Guardian);

  const guardian = await Guardian.deployed();
  await guardian.initialize(accounts[0]);
};
