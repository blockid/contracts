const { getEnsLabelHash, getEnsNameHash } = require('blockid');

const ENSMock = artifacts.require('ENSMock.sol');
const ENSRegistrarMock = artifacts.require('ENSRegistrarMock.sol');
const ENSResolver = artifacts.require('ENSResolver.sol');

contract('ENSRegistrarMock', (accounts) => {
  let ens;
  let ensRegistrar;
  let ensResolver;

  before(async () => {
    ens = await ENSMock.deployed();
    ensRegistrar = await ENSRegistrarMock.deployed();
    ensResolver = await ENSResolver.deployed();
  });

  it('should register name account1.test for accounts[1]', async () => {

    const nameHash = getEnsNameHash('account1.test');
    const labelHash = getEnsLabelHash('account1');

    await ensRegistrar.register(labelHash, accounts[1], {
      from: accounts[0],
    });

    await ens.setResolver(nameHash, ensResolver.address, {
      from: accounts[1],
    });

    await ensResolver.setAddr(nameHash, accounts[1], {
      from: accounts[1]
    });

    const address = await ensResolver.addr(nameHash);

    assert.strictEqual(address, accounts[1]);
  });
});