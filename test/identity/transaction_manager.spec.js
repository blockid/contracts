const { getLabelHash } = require('../../utils/ens');
const { getMessageSignature } = require('../../utils/signature');
const { getBalance, ethToWei } = require('../../utils/web3');
const { ensRoot } = require('./constans');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const IdentityRegistry = artifacts.require('IdentityRegistry.sol');

contract('IdentityTransactionManager', (accounts) => {
  let balance;
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await IdentityRegistry.deployed();
  });

  describe('methods', () => {
    let identity;
    let nonce = 0;

    before(async () => {
      const ensName = `idmtm.${ensRoot.name}`;
      const ensLabelHash = getLabelHash(ensName);

      const messageSignature = getMessageSignature(accounts[1], registry.address, ensRoot.nameHash, ensLabelHash);

      const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

      identity = Identity.at(log.args.identity);

      await identity.addMember(nonce++, accounts[2], identity.address, ethToWei(0.2), false, {
        from: accounts[1],
      });

      await identity.addMember(nonce++, accounts[3], accounts[4], ethToWei(0.3), false, {
        from: accounts[1],
      });
    });

    describe('#anonymous() payable', () => {
      it('should receive transaction', async () => {
        await identity.send(ethToWei(2), {
          from: accounts[0],
        });

        balance = await getBalance(identity);

        assert.strictEqual(balance.toNumber(10), ethToWei(2));
      });
    });

    describe('#executeTransaction()', () => {
      it('should execute valid transaction by unlimited member', async () => {
        const { logs: [log] } = await identity.executeTransaction(nonce++, accounts[5], ethToWei(0.3), '0x', {
          from: accounts[1],
        });

        assert.strictEqual(log.event, 'TransactionExecuted');
        assert.strictEqual(log.args.to, accounts[5]);
        assert.strictEqual(log.args.value.toNumber(10), ethToWei(0.3));
        assert.strictEqual(log.args.data, '0x');
        assert.isTrue(log.args.succeeded);

        balance = await getBalance(identity);

        assert.strictEqual(balance.toNumber(10), ethToWei(1.7));
      });

      it('should execute valid transaction by limited member', async () => {
        const { logs } = await identity.executeTransaction(nonce++, accounts[4], ethToWei(0.1), '0x', {
          from: accounts[3],
        });

        assert.strictEqual(logs[0].event, 'MemberLimitUpdated');
        assert.strictEqual(logs[0].args.member, accounts[3]);
        assert.strictEqual(logs[0].args.limit.toNumber(10), ethToWei(0.2));

        assert.strictEqual(logs[1].event, 'TransactionExecuted');
        assert.strictEqual(logs[1].args.to, accounts[4]);
        assert.strictEqual(logs[1].args.value.toNumber(10), ethToWei(0.1));
        assert.strictEqual(logs[1].args.data, '0x');
        assert.isTrue(logs[1].args.succeeded);

        balance = await getBalance(identity);

        assert.strictEqual(balance.toNumber(10), ethToWei(1.6));
      });

      it('should fail on invalid member limit', (done) => {
        identity
          .executeTransaction(nonce++, accounts[5], ethToWei(2), '0x', {
            from: accounts[2],
          })
          .then(() => done('should fail'))
          .catch(() => done());
      });

      it('should fail on invalid member purpose', (done) => {
        identity
          .executeTransaction(nonce++, accounts[5], ethToWei(0.1), '0x', {
            from: accounts[3],
          })
          .then(() => done('should fail'))
          .catch(() => done());
      });
    });
  });
});