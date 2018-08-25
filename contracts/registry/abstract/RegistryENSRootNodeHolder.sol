pragma solidity ^0.4.24;

/**
 * Abstract Registry ENS Root Node Holder
 */
contract AbstractRegistryENSRootNodeHolder {

  // events

  event EnsRootNodeAdded(bytes32 ensRootNode);
  event EnsRootNodeRemoved(bytes32 ensRootNode);

  // methods

  function ensRootNodeExists(bytes32 _ensRootNode) public view returns (bool);

  function addEnsRootNode(bytes32 _ensRootNode) public;

  function removeEnsRootNode(bytes32 _ensRootNode) public;
}
