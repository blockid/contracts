const {
  normalizeEnsName,
  getEnsNameHash,
  getEnsLabelHash,
  getEnsNameInfo,
  prepareAddress,
} = require('blockid');

const AbstractENS = artifacts.require('AbstractENS.sol');
const AbstractENSFIFSRegistrar = artifacts.require('AbstractENSFIFSRegistrar.sol');
const AbstractRegistry = artifacts.require('AbstractRegistry.sol');
const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock.sol');

module.exports = function(deployer, network, [account]) {
  deployer.then(async () => {
    let ens;

    switch (network) {
      case 'prod': {
        const labels = (process.env.PROD_ENS_LABELS || '')
          .split(',')
          .map(label => label.trim())
          .filter(label => !!label);

        for (const label of labels) {
          const name = normalizeEnsName(label, process.env.PROD_ENS_ROOT_NODE);

          const { nameHash, labelHash, rootNode } = getEnsNameInfo(name);

          ens = AbstractENS.at(process.env.PROD_ENS_ADDRESS);

          const owner = prepareAddress(await ens.owner(nameHash));

          switch (owner) {
            case account:
              break;

            case null:
              switch (rootNode.name) {
                case "test":
                  const registrarAddress = await ens.owner(rootNode.nameHash);
                  const registrar = AbstractENSFIFSRegistrar.at(registrarAddress);
                  await registrar.register(labelHash, account);
                  break;

                default:
                  throw new Error('Invalid account');
              }
              break;

            default:
              const registry = AbstractRegistry.at(owner);
              await registry.removeEnsRootNode(nameHash);
          }
        }
        break;
      }
      case 'test': {
        ens = await deployer.deploy(ENSMock);

        const names = [
          'blockid.test',
          'demo.test',
          'example.test',
        ];

        const registrar = await deployer.deploy(ENSRegistrarMock, ens.address, getEnsNameHash('test'));
        await ens.setSubnodeOwner('0x0', getEnsLabelHash('test'), registrar.address);

        for (const name of names) {
          const { labelHash } = getEnsNameInfo(name);
          await registrar.register(labelHash, account);
        }
        break;
      }
    }

    await deployer.deploy(ENSResolver, ens.address);
  });
};
