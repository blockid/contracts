pragma solidity ^0.4.24;

import "../libs/AddressLib.sol";
import "../libs/SignatureLib.sol";
import "../ownership/Ownable.sol";
import "../ens/abstract/ENS.sol";
import "../ens/ENSResolver.sol";
import "./abstract/IdentityRegistry.sol";
import "./abstract/Identity.sol";

/**
 * Identity Registry
 */
contract IdentityRegistry is AbstractIdentityRegistry {

  using AddressLib for address;
  using SignatureLib for bytes;

  bytes32 constant ENS_REGISTRY_LABEL = keccak256("registry");

  AbstractENS ens;
  ENSResolver ensResolver;
  address identityBase;

  mapping(bytes32 => address) ensRootNodesOwners;
  mapping(address => bool) registeredIdentities;

  constructor(AbstractENS _ens, ENSResolver _ensResolver, address _identityBase) public {
    ens = _ens;
    ensResolver = _ensResolver;
    identityBase = _identityBase;
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

  /**
   * checks if identity exists
   *
   * @param _identity identity address
   */
  function identityExists(address _identity) public view returns (bool) {
    return registeredIdentities[_identity];
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

    emit ENSRootNodeAdded(_ensRootNode);
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

    emit ENSRootNodeRemoved(_ensRootNode);
  }

  /**
   * creates identity
   *
   * @param _ensRootNode ENS root node
   * @param _ensLabel ENS sub node label
   * @param _messageSignature message signature keccak256(address(this), _ensRootNode, _ensLabel)
   */
  function createIdentity(bytes32 _ensRootNode, bytes32 _ensLabel, bytes _messageSignature) public {
    require(
      ensRootNodeExists(_ensRootNode),
      "ENS root node doesn't exists"
    );

    bytes32 ensNode = keccak256(abi.encodePacked(_ensRootNode, _ensLabel));

    require(
      ensResolver.addr(ensNode) == address(0),
      "ENS label already taken"
    );

    address messageSigner = _messageSignature.recoverAddress(abi.encodePacked(
        address(this),
        _ensRootNode,
        _ensLabel
      ));

    address identity = identityBase.cloneContract();

    AbstractIdentity(identity).addFirstMember(messageSigner);

    ens.setSubnodeOwner(_ensRootNode, _ensLabel, address(this));
    ens.setResolver(ensNode, address(ensResolver));

    ensResolver.setAddr(ensNode, identity);

    registeredIdentities[identity] = true;

    emit IdentityCreated(identity, messageSigner, _ensRootNode, _ensLabel);
  }

  /**
   * creates self identity
   *
   * @param _ensRootNode ENS root node
   * @param _ensLabel ENS sub node label
   */
  function createSelfIdentity(bytes32 _ensRootNode, bytes32 _ensLabel) public {
    require(
      ensRootNodeExists(_ensRootNode),
      "ENS root node doesn't exists"
    );

    bytes32 ensNode = keccak256(abi.encodePacked(_ensRootNode, _ensLabel));

    require(
      ensResolver.addr(ensNode) == address(0),
      "ENS label already taken"
    );

    address identity = identityBase.cloneContract();

    AbstractIdentity(identity).addFirstMember(msg.sender);

    ens.setSubnodeOwner(_ensRootNode, _ensLabel, address(this));
    ens.setResolver(ensNode, address(ensResolver));

    ensResolver.setAddr(ensNode, identity);

    registeredIdentities[identity] = true;

    emit IdentityCreated(identity, msg.sender, _ensRootNode, _ensLabel);
  }
}
