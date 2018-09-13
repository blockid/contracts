const expect = require('expect');
const { getEnsNameInfo, buildPersonalMessage, anyToHex } = require('eth-utils');
const { getPersonalMessageSignature } = require('../shared');
const { createRandomSharedAccount } = require('./helpers');
const { getRandomEnsNameInfo } = require('./utils');

const ENSMock = artifacts.require('ENSMock');
const ENSResolver = artifacts.require('ENSResolver');
const Registry = artifacts.require('Registry');

contract.skip('Registry', ([mainAccount, guardianMember, member]) => {
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await Registry.deployed();
  });

  describe('ens', () => {

    const { nameHash, rootNode } = getEnsNameInfo('registry.blockid.test');

    it('should return valid ens owner', async () => {
      const owner = await ens.owner(rootNode.nameHash);
      expect(owner).toBe(registry.address);
    });

    it('should return valid ens address', async () => {
      const address = await ensResolver.addr(nameHash);
      expect(address).toBe(registry.address);
    });
  });

  describe('views', () => {
    let sharedAccount;

    before(async () => {
      sharedAccount = await createRandomSharedAccount(mainAccount, guardianMember);
    });

    describe('#sharedAccountExists()', () => {

      it('should return true when shared account exists', async () => {
        const result = await registry.sharedAccountExists(sharedAccount.address);
        expect(result).toBeTruthy();
      });

      it('should return false when shared account doesn\'t exists', async () => {
        const result = await registry.sharedAccountExists(guardianMember);
        expect(result).toBeFalsy();
      });
    });
  });

  describe('methods', () => {
    describe('#createSharedAccount()', () => {

      it('should create shared account with ens name and accounts[1] member', async () => {
        const { nameHash, labelHash, rootNode } = getRandomEnsNameInfo();

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

        expect(log.event).toBe('SharedAccountCreated');
        expect(log.args.member).toBe(member);

        {
          const address = await ens.owner(nameHash);
          expect(address).toBe(registry.address);
        }

        {
          const address = await ens.resolver(nameHash);
          expect(address).toBe(ensResolver.address);
        }

        {
          const address = await ensResolver.addr(nameHash);
          expect(address).toBe(log.args.sharedAccount);
        }
      });
    });
  });
});
