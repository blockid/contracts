const { getEnsLabelHash, abiEncodePacked, anyToHex } = require('eth-utils');
const { getEnsNamesInfo, getPersonalMessageSignature } = require('../shared');

const AddressLib = artifacts.require('AddressLib');
const AddressArrayLib = artifacts.require('AddressArrayLib');
const SignatureLib = artifacts.require('SignatureLib');
const AbstractENS = artifacts.require('AbstractENS');
const ENSMock = artifacts.require('ENSMock');
const ENSResolver = artifacts.require('ENSResolver');
const Registry = artifacts.require('Registry');
const Guardian = artifacts.require('SharedAccount');

module.exports = async (deployer, network, [mainAccount, guardianMember]) => {

  // linking
  deployer.link(AddressLib, Registry);
  deployer.link(AddressArrayLib, Registry);
  deployer.link(SignatureLib, Registry);

  const ensNamesInfo = getEnsNamesInfo(network);

  const ens = await AbstractENS.at(
    network === 'prod'
      ? process.env.PROD_ENS_ADDRESS
      : ENSMock.address
  );

  await deployer.deploy(
    Registry,
    Guardian.address,
    ens.address,
    ENSResolver.address,
  );

  const registry = await Registry.deployed();
  const guardian = await Guardian.deployed();
  await guardian.addMember(0, guardianMember, registry.address, 0, false, 0, '0x');

  const labelHash = getEnsLabelHash('admin');

  for (const { nameHash } of ensNamesInfo) {
    await ens.setOwner(nameHash, registry.address);
    await registry.addEnsRootNode(nameHash);

    const message = abiEncodePacked(
      'address',
      'uint256',
      'bytes32',
      'bytes32'
    )(
      registry.address,
      0,
      labelHash,
      nameHash,
    );

    const memberMessageSignature = getPersonalMessageSignature(message, mainAccount, network);
    const guardianMessageSignature = getPersonalMessageSignature(memberMessageSignature, guardianMember, network);

    await registry.createSharedAccount(
      0,
      labelHash,
      nameHash,
      anyToHex(memberMessageSignature, { add0x: true }),
      anyToHex(guardianMessageSignature, { add0x: true }),
    );
  }
};
