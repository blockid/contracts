const BN = require('bn.js');
const expect = require('expect');
const { convertUnit, Units, abiEncodePacked, getAbiMethodSignature, anyToHex } = require('eth-utils');
const { getPersonalMessageSignature } = require('../shared');
const { createRandomSharedAccount } = require('./helpers');

contract('SharedAccountSignedRefunded', ([mainAccount, guardianMember, member1, member2, member3, memberN]) => {

  let sharedAccount;
  let nonce = new BN(0);
  let gasPrice;

  before(async () => {
    sharedAccount = await createRandomSharedAccount(mainAccount, guardianMember);

    await sharedAccount.send(convertUnit(2, Units.Ether, Units.Wei), {
      from: memberN,
    });

    gasPrice = new BN(await web3.eth.getGasPrice(), 10);
  });

  describe('#addMember()', () => {

    const methodSignature = getAbiMethodSignature(
      'addMember',
      'uint256',  // _nonce
      'address',  // _member
      'address',  // _purpose
      'uint256',  // _limit
      'bool',     // _unlimited
      'uint256',  // _refundGasBase
      'bytes',    // _messageSignature
    );

    it('should add member by msg.sender', async () => {

      const purpose = sharedAccount.address;
      const limit = 0;
      const unlimited = true;

      const { logs } = await sharedAccount.addMember(
        nonce,
        member1,
        purpose,
        limit,
        unlimited,
        0,
        '0x',
      );

      expect(logs[0].event).toBe('MemberAdded');
      expect(logs[0].args.sender).toBe(mainAccount);
      expect(logs[0].args.member).toBe(member1);
      expect(logs[0].args.purpose).toBe(purpose);
      expect(logs[0].args.limit.toNumber()).toBe(limit);
      expect(logs[0].args.unlimited).toBe(unlimited);

      expect(logs[1].event).toBe('NonceUpdated');

      nonce = logs[1].args.nonce;
    });

    it('should add member with message signature', async () => {

      const purpose = sharedAccount.address;
      const limit = 100;
      const unlimited = false;

      const message = abiEncodePacked(
        'address',  // address(this)
        'bytes',    // msg.sig
        'uint256',  // _nonce
        'address',  // _member
        'address',  // _purpose
        'uint256',  // _limit
        'bool',     // _unlimited
        'uint256',  // _refundGasBase
        'uint256',  // tx.gasprice
      )(
        sharedAccount.address,
        methodSignature,
        nonce,
        member2,
        purpose,
        limit,
        unlimited,
        0,
        gasPrice,
      );

      // signed by member1
      const messageSignature = anyToHex(getPersonalMessageSignature(message, member1), { add0x: true });

      const { logs } = await sharedAccount.addMember(
        nonce,
        member2,
        purpose,
        limit,
        unlimited,
        0,
        messageSignature, {
          from: member2,
          gasPrice,
        },
      );

      expect(logs[0].event).toBe('MemberAdded');
      expect(logs[0].args.sender).toBe(member1);
      expect(logs[0].args.member).toBe(member2);
      expect(logs[0].args.purpose).toBe(purpose);
      expect(logs[0].args.limit.toNumber()).toBe(limit);
      expect(logs[0].args.unlimited).toBeFalsy();

      expect(logs[1].event).toBe('NonceUpdated');

      nonce = logs[1].args.nonce;
    });

    it('should add member with message signature and refund used gas to sender', async () => {

      const refundGasBase = 100; // should be calculated
      const purpose = member2;
      const limit = 30;
      const unlimited = false;

      const message = abiEncodePacked(
        'address',  // address(this)
        'bytes',    // msg.sig
        'uint256',  // _nonce
        'address',  // _member
        'address',  // _purpose
        'uint256',  // _limit
        'bool',     // _unlimited
        'uint256',  // _refundGasBase
        'uint256',  // tx.gasprice
      )(
        sharedAccount.address,
        methodSignature,
        nonce,
        member3,
        purpose,
        limit,
        unlimited,
        refundGasBase,
        gasPrice,
      );

      // signed by member2
      const messageSignature = anyToHex(getPersonalMessageSignature(message, member2), { add0x: true });

      const { logs } = await sharedAccount.addMember(
        nonce,
        member3,
        purpose,
        limit,
        unlimited,
        refundGasBase,
        messageSignature, {
          from: member3,
          gasPrice,
        },
      );

      expect(logs[0].event).toBe('MemberLimitUpdated');
      expect(logs[0].args.sender).toBe(member2);
      expect(logs[0].args.member).toBe(member2);
      expect(logs[0].args.limit.toNumber()).toBe(100 - 30);

      expect(logs[1].event).toBe('MemberAdded');
      expect(logs[1].args.sender).toBe(member2);
      expect(logs[1].args.member).toBe(member3);
      expect(logs[1].args.purpose).toBe(purpose);
      expect(logs[1].args.limit.toNumber()).toBe(limit);
      expect(logs[1].args.unlimited).toBeFalsy();

      expect(logs[2].event).toBe('NonceUpdated');

      expect(logs[3].event).toBe('GasRefunded');

      nonce = logs[2].args.nonce;
    });
  });

  describe('#updateMemberLimit()', () => {

    it('should update member limit by limited', async () => {
      const limit = 40;

      const { logs } = await sharedAccount.updateMemberLimit(
        nonce,
        member3,
        limit,
        0,
        '0x', {
          from: member2,
        },
      );

      expect(logs[0].event).toBe('MemberLimitUpdated');
      expect(logs[0].args.member).toBe(member2);
      expect(logs[0].args.limit.toNumber()).toBe(100 - limit);

      expect(logs[1].event).toBe('MemberLimitUpdated');
      expect(logs[1].args.member).toBe(member3);
      expect(logs[1].args.limit.toNumber()).toBe(limit);

      expect(logs[2].event).toBe('NonceUpdated');

      nonce = logs[2].args.nonce;
    });

    it('should update member limit by unlimited', async () => {
      const limit = 120;

      const { logs } = await sharedAccount.updateMemberLimit(
        nonce,
        member2,
        limit,
        0,
        '0x', {
          from: member1,
        },
      );

      expect(logs[0].event).toBe('MemberLimitUpdated');
      expect(logs[0].args.member).toBe(member2);
      expect(logs[0].args.limit.toNumber()).toBe(limit);

      expect(logs[1].event).toBe('NonceUpdated');

      nonce = logs[1].args.nonce;
    });
  });

  describe('#removeMember()', () => {

    it('should remove member by limited', async () => {
      const { logs } = await sharedAccount.removeMember(
        nonce,
        member3,
        0,
        '0x', {
          from: member2,
        },
      );

      expect(logs[0].event).toBe('MemberLimitUpdated');
      expect(logs[0].args.member).toBe(member2);
      expect(logs[0].args.limit.toNumber()).toBe(120 + 40);

      expect(logs[1].event).toBe('MemberRemoved');
      expect(logs[1].args.member).toBe(member3);

      expect(logs[2].event).toBe('NonceUpdated');

      nonce = logs[2].args.nonce;
    });
  });

  describe('#executeTransaction()', () => {

    it('should execute by limited', async () => {
      const to = memberN;
      const value = 10;

      const { logs } = await sharedAccount.executeTransaction(
        nonce,
        to,
        value,
        '0x',
        0,
        '0x', {
          from: member2,
        },
      );

      expect(logs[0].event).toBe('MemberLimitUpdated');
      expect(logs[0].args.member).toBe(member2);
      expect(logs[0].args.limit.toNumber()).toBe(160 - value);

      expect(logs[1].event).toBe('TransactionExecuted');
      expect(logs[1].args.to).toBe(to);
      expect(logs[1].args.value.toNumber()).toBe(value);

      expect(logs[2].event).toBe('NonceUpdated');

      nonce = logs[2].args.nonce;
    });
  });
});
