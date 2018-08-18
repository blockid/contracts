const { getNameHash, getLabelHash } = require('../../utils/ens');
const { getMessageSignature } = require('../../utils/signature');
const { ensRoot } = require('./constans');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const IdentityRegistry = artifacts.require('IdentityRegistry.sol');

contract('IdentityRegistry', (accounts) => {
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await IdentityRegistry.deployed();
  });

  describe('ens', () => {

    it('should return valid ens owner', async () => {
      const owner = await ens.owner(ensRoot.nameHash);
      assert.strictEqual(owner, registry.address);
    });

    it('should return registry address for "id" ens label', async () => {
      const ensName = `registry.${ensRoot.name}`;
      const ensNameHash = getNameHash(ensName);
      const address = await ensResolver.addr(ensNameHash);
      assert.strictEqual(address, registry.address);
    });
  });

  describe('views', () => {
    let identity;

    before(async () => {
      const ensName = `idrv.${ensRoot.name}`;
      const ensLabelHash = getLabelHash(ensName);

      const messageSigner = accounts[1];
      const messageSignature = getMessageSignature(messageSigner, registry.address, ensRoot.nameHash, ensLabelHash);

      const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

      assert.strictEqual(log.event, 'IdentityCreated');
      assert.strictEqual(log.args.member, messageSigner);

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

      it('should create identity with ids1.blockid.test ens name and accounts[1] management key', async () => {
        const ensName = `idrm.${ensRoot.name}`;
        const ensNameHash = getNameHash(ensName);
        const ensLabelHash = getLabelHash(ensName);

        const messageSigner = accounts[1];
        const messageSignature = getMessageSignature(messageSigner, registry.address, ensRoot.nameHash, ensLabelHash);

        const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

        assert.strictEqual(log.event, 'IdentityCreated');
        assert.strictEqual(log.args.member, messageSigner);

        {
          const address = await ens.owner(ensNameHash);
          assert.strictEqual(address, registry.address);
        }

        {
          const address = await ens.resolver(ensNameHash);
          assert.strictEqual(address, ensResolver.address);
        }

        {
          const address = await ensResolver.addr(ensNameHash);
          assert.strictEqual(address, log.args.identity);
        }
      });
    });
  });
});