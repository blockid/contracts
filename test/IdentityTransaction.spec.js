const { network } = require('./fixtures');
const { getRandomEnsNameInfo } = require('./utils');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const Registry = artifacts.require('Registry.sol');

contract('IdentityTransaction', (accounts) => {
  let balance;
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await Registry.deployed();
  });

  describe('methods', () => {
    let identity;
    let nonce = 0;

    before(async () => {
      const { labelHash, rootNode } = getRandomEnsNameInfo();

      const { logs: [log] } = await registry.createSelfIdentity(labelHash, rootNode.nameHash, {
        from: accounts[1],
      });

      identity = Identity.at(log.args.identity);

      await identity.addMember(nonce++, accounts[2], identity.address, 20, false, {
        from: accounts[1],
      });

      await identity.addMember(nonce++, accounts[3], accounts[4], 30, false, {
        from: accounts[1],
      });
    });

    describe('#anonymous() payable', () => {
      it('should receive transaction', async () => {
        await identity.send(100, {
          from: accounts[0],
        });

        balance = await network.getBalance(identity);

        assert.strictEqual(balance.toNumber(), 100);
      });
    });

    describe('#executeTransaction()', () => {
      it('should execute valid transaction by unlimited member', async () => {
        const { logs: [log] } = await identity.executeTransaction(nonce++, accounts[5], 10, '0x', {
          from: accounts[1],
        });

        assert.strictEqual(log.event, 'TransactionExecuted');
        assert.strictEqual(log.args.to, accounts[5]);
        assert.strictEqual(log.args.value.toNumber(), 10);
        assert.strictEqual(log.args.data, '0x');
        assert.isTrue(log.args.succeeded);

        balance = await network.getBalance(identity);

        assert.strictEqual(balance.toNumber(), 90);
      });

      it('should execute valid transaction by limited member', async () => {
        const { logs } = await identity.executeTransaction(nonce++, accounts[4], 10, '0x', {
          from: accounts[3],
        });

        assert.strictEqual(logs[0].event, 'MemberLimitUpdated');
        assert.strictEqual(logs[0].args.member, accounts[3]);
        assert.strictEqual(logs[0].args.limit.toNumber(10), 20);

        assert.strictEqual(logs[1].event, 'TransactionExecuted');
        assert.strictEqual(logs[1].args.to, accounts[4]);
        assert.strictEqual(logs[1].args.value.toNumber(), 10);
        assert.strictEqual(logs[1].args.data, '0x');
        assert.isTrue(logs[1].args.succeeded);

        balance = await network.getBalance(identity);

        assert.strictEqual(balance.toNumber(), 80);
      });

      it('should fail on invalid member limit', (done) => {
        identity
          .executeTransaction(nonce++, accounts[5], 70, '0x', {
            from: accounts[2],
          })
          .then(() => done('should fail'))
          .catch(() => done());
      });

      it('should fail on invalid member purpose', (done) => {
        identity
          .executeTransaction(nonce++, accounts[5], 10, '0x', {
            from: accounts[3],
          })
          .then(() => done('should fail'))
          .catch(() => done());
      });
    });
  });
});