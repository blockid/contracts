pragma solidity ^0.4.24;

import "./RegistryENS.sol";
import "./RegistryGuardian.sol";
import "./RegistrySharedAccount.sol";

/**
 * Abstract Registry
 */
contract AbstractRegistry is AbstractRegistryENS, AbstractRegistryGuardian, AbstractRegistrySharedAccount {

}
