pragma solidity ^0.4.24;

/**
 * Abstract Registry ENS
 */
contract AbstractRegistryENS {

  event EnsRootNodeAdded(bytes32 ensRootNode);
  event EnsRootNodeRemoved(bytes32 ensRootNode);

  function ensRootNodeExists(bytes32 _ensRootNode) public view returns (bool);

  function addEnsRootNode(bytes32 _ensRootNode) public;

  function removeEnsRootNode(bytes32 _ensRootNode) public;
}
