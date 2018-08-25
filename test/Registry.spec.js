const { getEnsNameInfo, buildPersonalMessage, anyToHex } = require('blockid');
const { keyPairs } = require('./fixtures');
const { getRandomEnsNameInfo } = require('./utils');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const Registry = artifacts.require('Registry.sol');

contract('Registry', (accounts) => {
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
      assert.strictEqual(owner, registry.address);
    });

    it('should return valid ens address', async () => {
      const address = await ensResolver.addr(nameHash);
      assert.strictEqual(address, registry.address);
    });
  });

  describe('views', () => {
    let identity;

    before(async () => {
      const { labelHash, rootNode } = getRandomEnsNameInfo();
      const { logs: [log] } = await registry.createSelfIdentity(labelHash, rootNode.nameHash);
      identity = Identity.at(log.args.identity);
    });

    describe('#identityExists()', () => {

      it('should return true when identity exists', async () => {
        const result = await registry.identityExists(identity.address);
        assert.isTrue(result);
      });

      it('should return false when identity doesn\'t exists', async () => {
        const result = await registry.identityExists(accounts[1]);
        assert.isFalse(result);
      });
    });
  });

  describe('methods', () => {
    describe('#createIdentity()', () => {

      it('should create identity with ens name and accounts[1] member', async () => {
        const { nameHash, labelHash, rootNode } = getRandomEnsNameInfo();

        const message = buildPersonalMessage(
          'address',
          'bytes32',
          'bytes32'
        )(
          registry.address,
          labelHash,
          rootNode.nameHash,
        );

        const messageSignature = keyPairs[1].signPersonalMessage(message);

        const { logs: [log] } = await registry.createIdentity(
          labelHash,
          rootNode.nameHash,
          anyToHex(messageSignature, { add0x: true }),
        );

        assert.strictEqual(log.event, 'IdentityCreated');
        assert.strictEqual(log.args.member, accounts[1]);

        {
          const address = await ens.owner(nameHash);
          assert.strictEqual(address, registry.address);
        }

        {
          const address = await ens.resolver(nameHash);
          assert.strictEqual(address, ensResolver.address);
        }

        {
          const address = await ensResolver.addr(nameHash);
          assert.strictEqual(address, log.args.identity);
        }
      });
    });
  });
});