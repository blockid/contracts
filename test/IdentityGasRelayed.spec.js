const { buildPersonalMessage, anyToHex, convertUnit, Units } = require('blockid');
const { keyPairs, network } = require('./fixtures');
const { getRandomEnsNameInfo, getMethodSignature } = require('./utils');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const Identity = artifacts.require('Identity.sol');
const Registry = artifacts.require('Registry.sol');

contract('IdentityGasRelayed', (accounts) => {
  let ens;
  let ensResolver;
  let registry;

  before(async () => {
    ens = await ENSMock.deployed();
    ensResolver = await ENSResolver.deployed();
    registry = await Registry.deployed();
  });

  describe('methods', () => {
    let nonce = 0;
    let identity;

    const gasStation = accounts[9];

    before(async () => {
      const { labelHash, rootNode } = getRandomEnsNameInfo();

      const { logs: [log] } = await registry.createSelfIdentity(labelHash, rootNode.nameHash, {
        from: accounts[1],
      });

      identity = Identity.at(log.args.identity);

      await identity.send(anyToHex(convertUnit(1, Units.Ether, Units.Wei), { add0x: true }));
    });

    describe('#gasRelayedAddMember()', () => {

      it('should add member', async () => {
        const methodSignature = getMethodSignature(
          'gasRelayedAddMember',
          'uint256', // nonce
          'address', // member
          'address', // purpose
          'uint256', // limit
          'bool',    // unlimited
          'uint256', // extra gas
          'bytes',   // message signature
        );

        const member = accounts[2];
        const purpose = identity.address;
        const limit = 10;
        const gasPrice = anyToHex(await network.getGasPrice(), { add0x: true });
        const extraGas = 10;

        const message = buildPersonalMessage(
          'address', // identity address
          'bytes',   // method signature
          'uint256', // nonce
          'address', // member
          'address', // purpose
          'uint256', // limit
          'bool',    // unlimited
          'uint256', // extra gas
          'uint256', // gas price
        )(
          identity.address,
          methodSignature,
          nonce,
          member,
          purpose,
          limit,
          false,
          extraGas,
          gasPrice,
        );

        const messageSignature = keyPairs[1].signPersonalMessage(message);

        const { logs: [log] } = await identity.gasRelayedAddMember(
          nonce++,
          member,
          purpose,
          limit,
          false,
          extraGas,
          anyToHex(messageSignature, { add0x: true }), {
            from: gasStation,
            gasPrice,
          },
        );

        assert.strictEqual(log.event, 'MemberAdded');
      });
    });

    describe('#gasRelayedExecuteTransaction()', () => {

      it('should execute valid transaction', async () => {

        const methodSignature = getMethodSignature(
          'gasRelayedExecuteTransaction',
          'uint256', // nonce
          'address', // to
          'uint256', // value
          'bytes',   // data
          'uint256', // extra gas
          'bytes',   // message signature
        );

        const to = accounts[2];
        const value = 10;
        const data = '0x01';
        const gasPrice = anyToHex(await network.getGasPrice(), { add0x: true });
        const extraGas = 10;

        const message = buildPersonalMessage(
          'address', // identity address
          'bytes',   // method signature
          'uint256', // nonce
          'address', // to
          'uint256', // value
          'bytes',   // data
          'uint256', // extra gas
          'uint256', // gas price
        )(
          identity.address,
          methodSignature,
          nonce,
          to,
          value,
          data,
          extraGas,
          gasPrice,
        );

        const messageSignature = keyPairs[1].signPersonalMessage(message);

        const { logs: [log] } = await identity.gasRelayedExecuteTransaction(
          nonce++,
          to,
          value,
          data,
          extraGas,
          anyToHex(messageSignature, { add0x: true }), {
            from: gasStation,
            gasPrice,
          },
        );

        assert.strictEqual(log.event, 'TransactionExecuted');
      });
    });
  });
});