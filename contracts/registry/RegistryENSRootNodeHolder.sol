pragma solidity ^0.4.24;

import "../ens/abstract/ENS.sol";
import "../ens/ENSResolver.sol";
import "./abstract/RegistryENSRootNodeHolder.sol";

/**
 * Registry ENS Root Node Holder
 */
contract RegistryENSRootNodeHolder is AbstractRegistryENSRootNodeHolder {

  bytes32 constant ENS_REGISTRY_LABEL = keccak256("registry");

  AbstractENS ens;
  ENSResolver ensResolver;

  mapping(bytes32 => address) ensRootNodesOwners;

  constructor() internal {
    //
  }

  // public view

  /**
   * checks if ens root node exists
   *
   * @param _ensRootNode ENS root node
   */
  function ensRootNodeExists(bytes32 _ensRootNode) public view returns (bool) {
    return ensRootNodesOwners[_ensRootNode] != address(0);
  }

  // public methods

  /**
   * adds ENS root node
   *
   * @param _ensRootNode ENS root node
   */
  function addEnsRootNode(bytes32 _ensRootNode) public {
    require(
      ens.owner(_ensRootNode) == address(this),
      "ENS root node has different owner"
    );

    require(
      !ensRootNodeExists(_ensRootNode),
      "ENS root node already exists"
    );

    bytes32 ensNode = keccak256(abi.encodePacked(_ensRootNode, ENS_REGISTRY_LABEL));

    ens.setSubnodeOwner(_ensRootNode, ENS_REGISTRY_LABEL, address(this));
    ens.setResolver(ensNode, address(ensResolver));

    ensResolver.setAddr(ensNode, address(this));

    ensRootNodesOwners[_ensRootNode] = msg.sender;

    emit EnsRootNodeAdded(_ensRootNode);
  }

  /**
   * removes ENS root node
   *
   * @param _ensRootNode ENS root node
   */
  function removeEnsRootNode(bytes32 _ensRootNode) public {
    require(
      ensRootNodeExists(_ensRootNode),
      "ENS root node doesn't exists"
    );

    bytes32 ensNode = keccak256(abi.encodePacked(_ensRootNode, ENS_REGISTRY_LABEL));
    ensResolver.setAddr(ensNode, address(0));

    ens.setOwner(_ensRootNode, ensRootNodesOwners[_ensRootNode]);

    delete ensRootNodesOwners[_ensRootNode];

    emit EnsRootNodeRemoved(_ensRootNode);
  }
}
