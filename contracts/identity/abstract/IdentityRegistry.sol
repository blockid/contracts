pragma solidity ^0.4.24;

/**
 * Abstract Identity Registry
 */
contract AbstractIdentityRegistry {

  // events

  event ENSRootNodeAdded(bytes32 ensRootNode);
  event ENSRootNodeRemoved(bytes32 ensRootNode);
  event IdentityCreated(address identity, address member, bytes32 ensRootNode, bytes32 ensLabel);

  // methods

  function ensRootNodeExists(bytes32 _ensRootNode) public view returns (bool);

  function identityExists(address _identity) public view returns (bool);

  function addEnsRootNode(bytes32 _ensRootNode) public;

  function removeEnsRootNode(bytes32 _ensRootNode) public;

  function createIdentity(bytes32 _ensRootNode, bytes32 _ensLabel, bytes _messageSignature) public;

  function createSelfIdentity(bytes32 _ensRootNode, bytes32 _ensLabel) public;
}
