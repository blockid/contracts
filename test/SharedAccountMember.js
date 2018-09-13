const expect = require('expect');
const { ZERO_ADDRESS } = require('eth-utils');
const { createRandomSharedAccount } = require('./helpers');

contract('SharedAccountMember', ([mainAccount, guardianMember, member1, member2]) => {

  let sharedAccount;

  before(async () => {
    sharedAccount = await createRandomSharedAccount(mainAccount, guardianMember);

    await sharedAccount.addMember(0, member1, sharedAccount.address, 100, false, 0, '0x', {
      from: mainAccount,
    });

    await sharedAccount.addMember(1, member2, guardianMember, 30, false, 0, '0x', {
      from: member1,
    });
  });

  describe('#getMember()', () => {

    it('should return member', async () => {
      {
        const result = await sharedAccount.getMember(member1);

        expect(result.purpose).toBe(sharedAccount.address);
        expect(result.limit.toNumber()).toBe(100 - 30);
        expect(result.unlimited).toBeFalsy()
        expect(result.manager).toBe(ZERO_ADDRESS);
      }

      {
        const result = await sharedAccount.getMember(member2);

        expect(result.purpose).toBe(guardianMember);
        expect(result.limit.toNumber()).toBe(30);
        expect(result.unlimited).toBeFalsy()
        expect(result.manager).toBe(member1);
      }
    });
  });

  describe('#getPurposeMembers()', () => {

    it('should return purpose members', async () => {
      const result = await sharedAccount.getPurposeMembers(sharedAccount.address);

      expect(result.length).toBe(2);
      expect(result[0]).toBe(mainAccount);
      expect(result[1]).toBe(member1);
    });
  });

  describe('#memberExists()', () => {

    it('should return true when member exists', async () => {
      const result = await sharedAccount.memberExists(member1);

      expect(result).toBeTruthy();
    });

    it('should return false when member doesn\'t exists', async () => {
      const result = await sharedAccount.memberExists(guardianMember);

      expect(result).toBeFalsy();
    });
  });

  describe('#memberHasPurpose()', () => {

    it('should return true when member has purpose', async () => {
      const result = await sharedAccount.memberHasPurpose(member1, sharedAccount.address);

      expect(result).toBeTruthy();
    });

    it('should return false when member doesn\'t have purpose', async () => {
      const result = await sharedAccount.memberHasPurpose(member1, guardianMember);

      expect(result).toBeFalsy();
    });
  });

  describe('#verifyMemberLimit()', () => {

    it('should return true when member is unlimited', async () => {
      const result = await sharedAccount.verifyMemberLimit(mainAccount, 10);

      expect(result).toBeTruthy();
    });

    it('should return true when member has valid limit', async () => {
      const result = await sharedAccount.verifyMemberLimit(member1, 10);

      expect(result).toBeTruthy();
    });

    it('should return false when member has invalid limit', async () => {
      const result = await sharedAccount.verifyMemberLimit(member1, 200);

      expect(result).toBeFalsy();
    });
  });
});