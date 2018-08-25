pragma solidity ^0.4.24;

import "../ens/abstract/ENS.sol";
import "../ens/ENSResolver.sol";
import "./RegistryIdentityHolder.sol";

/**
 * Registry
 */
contract Registry is RegistryIdentityHolder {

  constructor(AbstractENS _ens, ENSResolver _ensResolver, address _identityBase) public {
    ens = _ens;
    ensResolver = _ensResolver;
    identityBase = _identityBase;
  }
}