const { buildPersonalMessage, anyToHex } = require('eth-utils');
const { getPersonalMessageSignature } = require('../../shared');
const { getRandomEnsNameInfo } = require('../utils');

const Registry = artifacts.require('Registry');
const SharedAccount = artifacts.require('SharedAccount');

async function createRandomSharedAccount(member, guardianMember) {
  const registry = await Registry.deployed();

  const { labelHash, rootNode } = getRandomEnsNameInfo();

  const message = buildPersonalMessage(
    'address',
    'uint256',
    'bytes32',
    'bytes32'
  )(
    registry.address,
    0,
    labelHash,
    rootNode.nameHash,
  );

  const memberMessageSignature = getPersonalMessageSignature(message, member);
  const guardianMessageSignature = getPersonalMessageSignature(memberMessageSignature, guardianMember);

  const { logs: [log] } = await registry.createSharedAccount(
    0,
    labelHash,
    rootNode.nameHash,
    anyToHex(memberMessageSignature, { add0x: true }),
    anyToHex(guardianMessageSignature, { add0x: true }),
  );

  return await SharedAccount.at(log.args.sharedAccount);
}

module.exports = {
  createRandomSharedAccount,
};
