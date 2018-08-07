const { getLabelHash } = require('../../utils/ens');
const { getMessageSignature } = require('../../utils/signature');
const { ethToWei } = require('../../utils/web3');
const { ensRoot } = require('./constans');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const IdentityRegistry = artifacts.require('IdentityRegistry.sol');

contract('IdentityMemberHolder', (accounts) => {
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
    let nonce = 0;

    before(async () => {
      const ensName = `idmhv.${ensRoot.name}`;
      const ensLabelHash = getLabelHash(ensName);

      const messageSignature = getMessageSignature(accounts[1], registry.address, ensRoot.nameHash, ensLabelHash);

      const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

      identity = Identity.at(log.args.identity);

      await identity.addMember(nonce++, accounts[2], accounts[3], ethToWei(1), {
        from: accounts[1],
      });

      await identity.addMember(nonce++, accounts[3], accounts[3], ethToWei(1), {
        from: accounts[1],
      });
    });

    describe("#getMember()", () => {

      it("should returns accounts[1] member", async () => {
        const [purpose, limit, limited] = await identity.getMember(accounts[1]);

        assert.equal(purpose, identity.address);
        assert.equal(limit.toNumber(), 0);
        assert.isFalse(limited);
      });

      it("should returns accounts[2] member", async () => {
        const [purpose, limit, limited] = await identity.getMember(accounts[2]);

        assert.equal(purpose, accounts[3]);
        assert.equal(limit.toNumber(), ethToWei(1));
        assert.isTrue(limited);
      });
    });

    describe("#getPurposeMembers()", () => {

      it("should returns valid member list", async () => {
        const list = await identity.getPurposeMembers(accounts[3]);

        assert.equal(list.length, 2);
        assert.equal(list[0], accounts[2]);
        assert.equal(list[1], accounts[3]);
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
          const result = await identity.verifyMemberLimit(accounts[1], ethToWei(1));
          assert.isTrue(result);
        }
        {
          const result = await identity.verifyMemberLimit(accounts[1], 0);
          assert.isTrue(result);
        }
      });

      it("should returns true for valid limit when member is limited ", async () => {
        {
          const result = await identity.verifyMemberLimit(accounts[2], ethToWei(1));
          assert.isTrue(result);
        }
        {
          const result = await identity.verifyMemberLimit(accounts[2], ethToWei(0.5));
          assert.isTrue(result);
        }
      });

      it("should returns false for invalid limit when member is limited ", async () => {
        const result = await identity.verifyMemberLimit(accounts[2], ethToWei(2));
        assert.isFalse(result);
      });
    });
  });

  describe("methods", () => {
    let identity;
    let nonce = 0;

    before(async () => {
      const ensName = `idmhm.${ensRoot.name}`;
      const ensLabelHash = getLabelHash(ensName);

      const messageSignature = getMessageSignature(accounts[1], registry.address, ensRoot.nameHash, ensLabelHash);

      const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

      identity = Identity.at(log.args.identity);
    });

    describe("#addMember()", () => {
      it('should add member with self purpose and limit of 1 eth by unlimited member', async () => {
        const { logs: [log] } = await identity.addMember(nonce++, accounts[2], identity.address, ethToWei(1), {
          from: accounts[1],
        });

        assert.equal(log.event, 'MemberAdded');
        assert.equal(log.args.member, accounts[2]);
        assert.equal(log.args.purpose, identity.address);
        assert.equal(log.args.limit.toNumber(10), ethToWei(1));
      });

      it('should add member with outside purpose and limit of 0.2 eth by limited member', async () => {
        const { logs } = await identity.addMember(nonce++, accounts[3], accounts[3], ethToWei(0.2), {
          from: accounts[2],
        });

        assert.equal(logs[0].event, 'MemberLimitUpdated');
        assert.equal(logs[0].args.member, accounts[2]);
        assert.equal(logs[0].args.limit.toNumber(10), ethToWei(0.8));

        assert.equal(logs[1].event, 'MemberAdded');
        assert.equal(logs[1].args.member, accounts[3]);
        assert.equal(logs[1].args.purpose, accounts[3]);
        assert.equal(logs[1].args.limit.toNumber(10), ethToWei(0.2));
      });
    });

    describe("#updateMemberLimit()", () => {
      it('should update member limit', async () => {
        const { logs: [log] } = await identity.updateMemberLimit(nonce++, accounts[2], ethToWei(2), {
          from: accounts[1],
        });

        assert.equal(log.event, 'MemberLimitUpdated');
        assert.equal(log.args.member, accounts[2]);
        assert.equal(log.args.limit.toNumber(10), ethToWei(2));
      });
    });

    describe("#removeMember()", () => {

      it('should remove member by limited', async () => {
        const { logs } = await identity.removeMember(nonce++, accounts[3], {
          from: accounts[2],
        });

        assert.equal(logs[0].event, 'MemberLimitUpdated');
        assert.equal(logs[0].args.member, accounts[2]);
        assert.equal(logs[0].args.limit.toNumber(10), ethToWei(2.2));

        assert.equal(logs[1].event, 'MemberRemoved');
        assert.equal(logs[1].args.member, accounts[3]);
      });

      it('should remove member by unlimited', async () => {
        const { logs: [log] } = await identity.removeMember(nonce++, accounts[2], {
          from: accounts[1],
        });

        assert.equal(log.event, 'MemberRemoved');
        assert.equal(log.args.member, accounts[2]);
      });
    });
  });
});