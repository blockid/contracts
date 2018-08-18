const { getLabelHash } = require('../../utils/ens');
const { getMethodSignature, getMessageSignature } = require('../../utils/signature');
const { ethToWei, getGasPrice } = require('../../utils/web3');
const { ensRoot } = require('./constans');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const IdentityRegistry = artifacts.require('IdentityRegistry.sol');

contract('IdentityGasRelayed', (accounts) => {
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await IdentityRegistry.deployed();
  });

  describe('methods', () => {
    let nonce = 0;
    let identity;

    const gasStation = accounts[9];

    before(async () => {
      const ensName = `idgrm.${ensRoot.name}`;
      const ensLabelHash = getLabelHash(ensName);

      const messageSignature = getMessageSignature(accounts[1], registry.address, ensRoot.nameHash, ensLabelHash);

      const { logs: [log] } = await registry.createIdentity(ensRoot.nameHash, ensLabelHash, messageSignature);

      identity = Identity.at(log.args.identity);

      identity.send(ethToWei(2));
    });

    describe('#gasRelayedAddMember()', () => {

      it('should add member', async () => {
        const msgSig = getMethodSignature(
          'gasRelayedAddMember',
          'uint256',
          'address',
          'address',
          'uint256',
          'bool',
          'uint256',
          'bytes',
        );

        const member = accounts[2];
        const purpose = identity.address;
        const limit = ethToWei(0.1);

        const gasPrice = await getGasPrice();
        const extraGas = 1;

        const messageSignature = getMessageSignature(
          accounts[1],
          identity.address,
          msgSig,
          nonce,
          member,
          purpose,
          limit,
          false,
          extraGas,
          gasPrice,
        );

        const { logs: [log] } = await identity.gasRelayedAddMember(
          nonce++,
          member,
          purpose,
          limit,
          false,
          extraGas,
          messageSignature, {
            from: gasStation,
          },
        );

        assert.strictEqual(log.event, 'MemberAdded');
      });
    });

    describe('#gasRelayedExecuteTransaction()', () => {

      it('should execute valid transaction', async () => {
        const msgSig = getMethodSignature(
          'gasRelayedExecuteTransaction',
          'uint256',
          'address',
          'uint256',
          'bytes',
          'uint256',
          'bytes',
        );

        const to = accounts[1];
        const value = ethToWei(0.1);
        const data = '0x';
        const gasPrice = await getGasPrice();
        const extraGas = 1;

        const messageSignature = getMessageSignature(
          accounts[1],
          identity.address,
          msgSig,
          nonce,
          to,
          value,
          data,
          extraGas,
          gasPrice,
        );

        const { logs: [log] } = await identity.gasRelayedExecuteTransaction(
          nonce++,
          to,
          value,
          data,
          extraGas,
          messageSignature, {
            from: gasStation,
            gasPrice,
          },
        );

        assert.strictEqual(log.event, 'TransactionExecuted');
      });
    });
  });
});