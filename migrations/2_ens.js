const { getNameHash, getLabelHash } = require('../utils/ens');

const AbstractENS = artifacts.require('AbstractENS.sol');
const ENSMock = artifacts.require('ENSMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock.sol');

module.exports = function(deployer, network, [account]) {

  if (process.env.PROD_ENS) {
    const ens = AbstractENS.at(process.env.PROD_ENS);
    deployer.deploy(ENSResolver, ens.address);
  } else {
    deployer
      .deploy(ENSMock)
      .then(async (ens) => {
        const registar = await deployer.deploy(ENSRegistrarMock, ens.address, getNameHash("eth"));
        await ens.setSubnodeOwner('0x0', getLabelHash("eth"), registar.address);
        await registar.register(getLabelHash("blockid.eth"), account);
        await deployer.deploy(ENSResolver, ens.address);
      });
  }
}
;
