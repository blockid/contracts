const { getEnsNameHash, getEnsLabelHash, prepareAddress } = require('eth-utils');
const { getEnsNamesInfo } = require('../shared');

const AbstractENS = artifacts.require('AbstractENS');
const AbstractENSFIFSRegistrar = artifacts.require('AbstractENSFIFSRegistrar');
const AbstractRegistry = artifacts.require('AbstractRegistry');
const ENSMock = artifacts.require('ENSMock');
const ENSResolver = artifacts.require('ENSResolver');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock');

module.exports = async (deployer, network, [account]) => {
  let ens;

  const ensNamesInfo = getEnsNamesInfo(network);

  switch (network) {
    case 'prod': {

      ens = await AbstractENS.at(process.env.PROD_ENS_ADDRESS);

      for (const { nameHash, labelHash, rootNode } of ensNamesInfo) {
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
      await deployer.deploy(ENSMock);

      ens = await ENSMock.deployed();

      const registrar = await deployer.deploy(ENSRegistrarMock, ens.address, getEnsNameHash('test'));
      await ens.setSubnodeOwner("0x00", getEnsLabelHash('test'), registrar.address);

      for (const { labelHash } of ensNamesInfo) {
        await registrar.register(labelHash, account);
      }
      break;
    }
  }

  await deployer.deploy(ENSResolver, ens.address);
};
