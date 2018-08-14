const { getNameHash, getLabelHash } = require('../utils/ens');
const { ZERO_ADDRESS } = require('../utils/web3');

const AbstractENS = artifacts.require('AbstractENS.sol');
const AbstractENSFIFSRegistrar = artifacts.require('AbstractENSFIFSRegistrar.sol');
const AbstractIdentityRegistry = artifacts.require('AbstractIdentityRegistry.sol');
const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock.sol');

module.exports = function(deployer, network, [account]) {
  deployer.then(async () => {
    let ens;

    switch (network) {
      case 'prod': {
        ens = AbstractENS.at(process.env.PROD_ENS_ADDRESS);
        const owner = await ens.owner(getNameHash(process.env.PROD_ENS_DOMAIN));

        switch (owner) {
          case account:
            break;

          case ZERO_ADDRESS:
            if (process.env.PROD_ENS_TLD === 'test') {
              const registrarAddress = await ens.owner(getNameHash(process.env.PROD_ENS_TLD));
              const registrar = AbstractENSFIFSRegistrar.at(registrarAddress);
              await registrar.register(getLabelHash(process.env.PROD_ENS_DOMAIN), account)
            } else {
              throw new Error('Invalid account');
            }
            break;

          default:
            const identityRegistry = AbstractIdentityRegistry.at(owner);
            await identityRegistry.removeEnsRootNode(getNameHash(process.env.PROD_ENS_DOMAIN));
        }

        break;
      }
      case 'test': {
        ens = await deployer.deploy(ENSMock);
        const registrar = await deployer.deploy(ENSRegistrarMock, ens.address, getNameHash('test'));
        await ens.setSubnodeOwner('0x0', getLabelHash('test'), registrar.address);
        await registrar.register(getLabelHash('blockid.test'), account);
        break;
      }
    }

    await deployer.deploy(ENSResolver, ens.address);
  });
};
