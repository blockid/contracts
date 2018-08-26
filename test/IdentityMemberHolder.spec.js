const { getRandomEnsNameInfo } = require('./utils');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const Registry = artifacts.require('Registry.sol');

contract('IdentityMemberHolder', (accounts) => {
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await Registry.deployed();
  });

  describe("views", () => {
    let identity;
    let nonce = 0;

    before(async () => {
      const { labelHash, rootNode } = getRandomEnsNameInfo();

      const { logs: [log] } = await registry.createSelfIdentity(labelHash, rootNode.nameHash, {
        from: accounts[1],
      });

      identity = Identity.at(log.args.identity);

      await identity.addMember(nonce++, accounts[2], accounts[3], 20, false, {
        from: accounts[1],
      });

      await identity.addMember(nonce++, accounts[3], accounts[3], 30, false, {
        from: accounts[1],
      });
    });

    describe("#getMember()", () => {

      it("should returns accounts[1] member", async () => {
        const [purpose, limit, unlimited] = await identity.getMember(accounts[1]);

        assert.strictEqual(purpose, identity.address);
        assert.strictEqual(limit.toNumber(), 0);
        assert.isTrue(unlimited);
      });

      it("should returns accounts[2] member", async () => {
        const [purpose, limit, unlimited] = await identity.getMember(accounts[2]);

        assert.strictEqual(purpose, accounts[3]);
        assert.strictEqual(limit.toNumber(), 20);
        assert.isFalse(unlimited);
      });
    });

    describe("#getPurposeMembers()", () => {

      it("should returns valid member list", async () => {
        const list = await identity.getPurposeMembers(accounts[3]);

        assert.strictEqual(list.length, 2);
        assert.strictEqual(list[0], accounts[2]);
        assert.strictEqual(list[1], accounts[3]);
      });

    });

    describe("#memberExists()", () => {

      it("should returns true when member exists", async () => {
        const result = await identity.memberExists(accounts[2]);
        assert.isTrue(result);
      });

      it("should returns false when member doesn\'t exists", async () => {
        const result = await identity.memberExists(accounts[5]);
        assert.isFalse(result);
      });

    });

    describe("#memberHasPurpose()", () => {

      it("should returns true when member has purpose", async () => {
        const result = await identity.memberHasPurpose(accounts[1], identity.address);
        assert.isTrue(result);
      });

      it("should returns false when member doesn\'t have purpose", async () => {
        const result = await identity.memberHasPurpose(accounts[1], accounts[2]);
        assert.isFalse(result);
      });

      it("should returns false when member doesn\'t exists", async () => {
        const result = await identity.memberHasPurpose(accounts[5], accounts[2]);
        assert.isFalse(result);
      });
    });

    describe("#verifyMemberLimit()", () => {

      it("should returns always true when member is unlimited", async () => {
        {
          const result = await identity.verifyMemberLimit(accounts[1], 10);
          assert.isTrue(result);
        }
        {
          const result = await identity.verifyMemberLimit(accounts[1], 0);
          assert.isTrue(result);
        }
      });

      it("should returns true for valid limit when member is limited ", async () => {
        {
          const result = await identity.verifyMemberLimit(accounts[2], 20);
          assert.isTrue(result);
        }
        {
          const result = await identity.verifyMemberLimit(accounts[3], 30);
          assert.isTrue(result);
        }
      });

      it("should returns false for invalid limit when member is limited ", async () => {
        const result = await identity.verifyMemberLimit(accounts[2], 40);
        assert.isFalse(result);
      });
    });
  });

  describe("methods", () => {
    let identity;
    let nonce = 0;

    before(async () => {
      const { labelHash, rootNode } = getRandomEnsNameInfo();

      const { logs: [log] } = await registry.createSelfIdentity(labelHash, rootNode.nameHash, {
        from: accounts[1],
      });

      identity = Identity.at(log.args.identity);
    });

    describe("#addMember()", () => {
      it('should add member with self purpose and limit of 10 wei by unlimited member', async () => {
        const { logs: [log] } = await identity.addMember(nonce++, accounts[2], identity.address, 10, false, {
          from: accounts[1],
        });

        assert.strictEqual(log.event, 'MemberAdded');
        assert.strictEqual(log.args.member, accounts[2]);
        assert.strictEqual(log.args.purpose, identity.address);
        assert.strictEqual(log.args.limit.toNumber(10), 10);
      });

      it('should add member with outside purpose and limit of 3 eth by limited member', async () => {
        const { logs } = await identity.addMember(nonce++, accounts[3], accounts[3], 3, false, {
          from: accounts[2],
        });

        assert.strictEqual(logs[0].event, 'MemberLimitUpdated');
        assert.strictEqual(logs[0].args.member, accounts[2]);
        assert.strictEqual(logs[0].args.limit.toNumber(10), 7);

        assert.strictEqual(logs[1].event, 'MemberAdded');
        assert.strictEqual(logs[1].args.member, accounts[3]);
        assert.strictEqual(logs[1].args.purpose, accounts[3]);
        assert.strictEqual(logs[1].args.limit.toNumber(10), 3);
      });
    });

    describe("#updateMemberLimit()", () => {
      it('should update member limit', async () => {
        const { logs: [log] } = await identity.updateMemberLimit(nonce++, accounts[2], 20, {
          from: accounts[1],
        });

        assert.strictEqual(log.event, 'MemberLimitUpdated');
        assert.strictEqual(log.args.member, accounts[2]);
        assert.strictEqual(log.args.limit.toNumber(10), 20);
      });
    });

    describe("#removeMember()", () => {

      it('should remove member by limited', async () => {
        const { logs } = await identity.removeMember(nonce++, accounts[3], {
          from: accounts[2],
        });

        assert.strictEqual(logs[0].event, 'MemberLimitUpdated');
        assert.strictEqual(logs[0].args.member, accounts[2]);
        assert.strictEqual(logs[0].args.limit.toNumber(10), 23);

        assert.strictEqual(logs[1].event, 'MemberRemoved');
        assert.strictEqual(logs[1].args.member, accounts[3]);
      });

      it('should remove member by unlimited', async () => {
        const { logs: [log] } = await identity.removeMember(nonce++, accounts[2], {
          from: accounts[1],
        });

        assert.strictEqual(log.event, 'MemberRemoved');
        assert.strictEqual(log.args.member, accounts[2]);
      });
    });
  });
});