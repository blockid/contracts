const expect = require('expect');
const { createRandomSharedAccount } = require('./helpers');

contract.skip('SharedAccountTransaction', ([mainAccount, guardianMember]) => {

  let sharedAccount;

  before(async () => {
    sharedAccount = await createRandomSharedAccount(mainAccount, guardianMember);
  });

  describe('#anonymous() payable', () => {

    it('should accept payable call', async () => {

      await sharedAccount.send(100);
      const balance = await web3.eth.getBalance(sharedAccount.address);

      expect(balance).toBe("100");
    });
  });
});
