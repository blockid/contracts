const {
  prepareEnsName,
  getEnsNameHash,
  getEnsLabelHash,
  splitEnsName,
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
        const name = prepareEnsName(process.env.PROD_ENS_LABEL, process.env.PROD_ENS_ROOT_NODE);
        const nameHash = getEnsNameHash(name);
        const { label, rootNodeName } = splitEnsName(name);
        const labelHash = getEnsLabelHash(label);
        const rootNodeNameHash = getEnsNameHash(rootNodeName);

        ens = AbstractENS.at(process.env.PROD_ENS_ADDRESS);

        const owner = prepareAddress(await ens.owner(nameHash));

        switch (owner) {
          case account:
            break;

          case null:
            switch (rootNodeName) {
              case "test":
                const registrarAddress = await ens.owner(rootNodeNameHash);
                const registrar = AbstractENSFIFSRegistrar.at(registrarAddress);
                await registrar.register(labelHash, account)
                break;

              default:
                throw new Error('Invalid account');
            }
            break;

          default:
            const registry = AbstractRegistry.at(owner);
            await registry.removeEnsRootNode(nameHash);
        }

        break;
      }
      case 'test': {
        ens = await deployer.deploy(ENSMock);
        const registrar = await deployer.deploy(ENSRegistrarMock, ens.address, getEnsNameHash('test'));
        await ens.setSubnodeOwner('0x0', getEnsLabelHash('test'), registrar.address);
        await registrar.register(getEnsLabelHash('blockid'), account);
        break;
      }
    }

    await deployer.deploy(ENSResolver, ens.address);
  });
};
