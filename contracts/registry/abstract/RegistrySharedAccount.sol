pragma solidity ^0.4.24;

/**
 * Abstract Registry Shared Account
 */
contract AbstractRegistrySharedAccount {

  event SharedAccountCreated(address sharedAccount, bytes32 ensLabel, bytes32 ensRootNode, address member);

  function sharedAccountExists(address _sharedAccount) public view returns (bool);

  function createSharedAccount(
    uint256 _salt,
    bytes32 _ensLabel,
    bytes32 _ensRootNode,
    bytes _memberMessageSignature,
    bytes _guardianMessageSignature
  ) public;
}
