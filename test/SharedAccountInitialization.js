const expect = require('expect');
const { createRandomSharedAccount } = require('./helpers');

contract.skip('SharedAccountInitialization', ([mainAccount, guardianMember, member2]) => {

  let sharedAccount;

  before(async () => {
    sharedAccount = await createRandomSharedAccount(mainAccount, guardianMember);
  });

  describe('#initialize()', () => {

    it('should reject on call', async () => {
      await expect(sharedAccount.initialize(member2)).rejects.toThrow();
    });
  });
});
