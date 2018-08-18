const { getLabelHash } = require('../../utils/ens');
const { getMessageSignature } = require('../../utils/signature');
const { ensRoot } = require('./constans');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const IdentityRegistry = artifacts.require('IdentityRegistry.sol');

contract('IdentityClaimHolder', (accounts) => {
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await IdentityRegistry.deployed();
  });

  describe("views", () => {
    let identity;
    let claimer;

    before(async () => {
      {
        const ensName = `idchv.${ensRoot.name}`;
        const ensLabelHash = getLabelHash(ensName);

        const messageSignature = getMessageSignature(accounts[1], registry.address, ensRoot.nameHash, ensLabelHash);

        const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

        identity = Identity.at(log.args.identity);
      }
      {
        const ensName = `claimerv.${ensRoot.name}`;
        const ensLabelHash = getLabelHash(ensName);

        const messageSignature = getMessageSignature(accounts[2], registry.address, ensRoot.nameHash, ensLabelHash);

        const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

        claimer = Identity.at(log.args.identity);
      }

      const signature = getMessageSignature(accounts[2], identity.address, 0, claimer.address, 1, '0x0a1b2c');

      await identity.addClaim(0, claimer.address, 1, '0x0a1b2c', signature, {
        from: accounts[1],
      });

    });

    describe('#getClaim()', () => {

      it('should return valid claim', async () => {
        const [issuer, topic, data, signingNonce] = await identity.getClaim(claimer.address, 1);

        assert.strictEqual(issuer, claimer.address);
        assert.strictEqual(topic.toNumber(10), 1);
        assert.strictEqual(data, '0x0a1b2c');
        assert.strictEqual(signingNonce.toNumber(10), 0);
      });
    });

  });

  describe("methods", () => {
    let identity;
    let claimer;
    let nonce = 0;

    before(async () => {
      {
        const ensName = `idchm.${ensRoot.name}`;
        const ensLabelHash = getLabelHash(ensName);

        const messageSignature = getMessageSignature(accounts[1], registry.address, ensRoot.nameHash, ensLabelHash);

        const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

        identity = Identity.at(log.args.identity);
      }
      {
        const ensName = `claimerm.${ensRoot.name}`;
        const ensLabelHash = getLabelHash(ensName);

        const messageSignature = getMessageSignature(accounts[2], registry.address, ensRoot.nameHash, ensLabelHash);

        const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

        claimer = Identity.at(log.args.identity);
      }
    });

    describe('#addClaim()', () => {

      it('should add new valid claim', async () => {
        const signature = getMessageSignature(accounts[2], identity.address, nonce, claimer.address, 1, '0x0a1b2c');

        const { logs: [log]} = await identity.addClaim(nonce++, claimer.address, 1, '0x0a1b2c', signature, {
          from: accounts[1],
        });

        assert.strictEqual(log.event, 'ClaimAdded');
        assert.strictEqual(log.args.issuer, claimer.address);
        assert.strictEqual(log.args.topic.toNumber(10), 1);
        assert.strictEqual(log.args.data, '0x0a1b2c');
        assert.strictEqual(log.args.signature, signature);
      });

      it('should fail on invalid claim signature', (done) => {
        const signature = getMessageSignature(accounts[2], '0x0a1b2c');

        identity
          .addClaim(nonce, claimer.address, 2, '0x0a1b2c', signature, {
            from: accounts[1],
          })
          .then(() => done('should fail'))
          .catch(() => done());
      });

      it('should fail on invalid claim signature signer', (done) => {
        const signature = getMessageSignature(accounts[3], identity.address, nonce, claimer.address, 2, '0x0a1b2c');

        identity
          .addClaim(nonce, claimer.address, 2, '0x0a1b2c', signature, {
            from: accounts[1],
          })
          .then(() => done('should fail'))
          .catch(() => done());
      });
    });

    describe('#removeClaim()', () => {

      it('should remove existing claim', async () => {

        const { logs: [log]} = await identity.removeClaim(nonce++, claimer.address, 1, {
          from: accounts[1],
        });

        assert.strictEqual(log.event, 'ClaimRemoved');
        assert.strictEqual(log.args.issuer, claimer.address);
        assert.strictEqual(log.args.topic.toNumber(10), 1);
      });
    });
  });
});