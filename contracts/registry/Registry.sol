pragma solidity ^0.4.24;

import "../sharedAccount/abstract/SharedAccount.sol";
import "../ens/abstract/ENS.sol";
import "../ens/ENSResolver.sol";
import "./RegistrySharedAccount.sol";

/**
 * Registry
 */
contract Registry is RegistrySharedAccount {

  constructor(AbstractSharedAccount _guardian, AbstractENS _ens, ENSResolver _ensResolver) public {
    guardian = _guardian;
    ens = _ens;
    ensResolver = _ensResolver;
  }
}