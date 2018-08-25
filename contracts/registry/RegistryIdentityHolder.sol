pragma solidity ^0.4.24;

import "../libs/AddressLib.sol";
import "../libs/SignatureLib.sol";
import "../identity/abstract/Identity.sol";
import "./abstract/RegistryIdentityHolder.sol";
import "./RegistryENSRootNodeHolder.sol";

/**
 * Identity Registry
 */
contract RegistryIdentityHolder is AbstractRegistryIdentityHolder, RegistryENSRootNodeHolder {

  using AddressLib for address;
  using SignatureLib for bytes;

  struct Identity {
    bool exists;
    uint256 claimNonce;
    mapping(bytes32 => IdentityClaim) claims;
  }

  struct IdentityClaim {
    uint256 nonce;
    address issuer;
    uint256 topic;
    bytes data;
    bytes signature;
  }

  address identityBase;

  mapping(address => Identity) identities;

  constructor() internal {
    //
  }

  // public views

  /**
   * checks if identity exists
   *
   * @param _identity identity address
   */
  function identityExists(address _identity) public view returns (bool) {
    return identities[_identity].exists;
  }

  /**
   * gets identity claim nonce
   *
   * @param _identity identity contract address
   */
  function getIdentityClaimNonce(address _identity) public view returns (uint256) {
    return identities[_identity].claimNonce;
  }

  /**
   * gets identity claim
   *
   * @param _identity identity contract address
   * @param _issuer issuer contract address
   * @param _topic claim topic
   */
  function getIdentityClaim(address _identity, address _issuer, uint256 _topic) public view returns (uint256 nonce, address issuer, uint256 topic, bytes data, bytes signature) {
    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    nonce = identities[_identity].claims[id].nonce;
    issuer = identities[_identity].claims[id].issuer;
    topic = identities[_identity].claims[id].topic;
    data = identities[_identity].claims[id].data;
    signature = identities[_identity].claims[id].signature;

    return;
  }



  /**
   * checks if identity claim exists
   *
   * @param _identity identity contract address
   * @param _issuer issuer contract address
   * @param _topic claim topic
   */
  function identityClaimExists(address _identity, address _issuer, uint256 _topic) public view returns (bool) {
    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    return identities[_identity].claims[id].issuer == _issuer;
  }


  // public methods

  /**
   * creates identity
   *
   * @param _ensLabel ENS sub node label
   * @param _ensRootNode ENS root node
   * @param _messageSignature message signature keccak256(address(this), _ensRootNode, _ensLabel)
   */
  function createIdentity(bytes32 _ensLabel, bytes32 _ensRootNode, bytes _messageSignature) public {
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
        _ensLabel,
        _ensRootNode
      ));

    address identity = identityBase.cloneContract();

    AbstractIdentity(identity).addFirstMember(messageSigner);

    ens.setSubnodeOwner(_ensRootNode, _ensLabel, address(this));
    ens.setResolver(ensNode, address(ensResolver));

    ensResolver.setAddr(ensNode, identity);

    identities[identity].exists = true;

    emit IdentityCreated(identity, messageSigner, _ensLabel, _ensRootNode);
  }

  /**
   * creates self identity
   *
   * @param _ensLabel ENS sub node label
   * @param _ensRootNode ENS root node
   */
  function createSelfIdentity(bytes32 _ensLabel, bytes32 _ensRootNode) public {
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

    identities[identity].exists = true;

    emit IdentityCreated(identity, msg.sender, _ensLabel, _ensRootNode);
  }

  /**
   * adds identity claim
   *
   * @param _nonce current claim nonce
   * @param _issuer issuer contract address
   * @param _topic claim topic
   * @param _data claim data
   * @param _signature claim signature
   */
  function addIdentityClaim(uint256 _nonce, address _issuer, uint256 _topic, bytes _data, bytes _signature) public {
    require(
      identities[msg.sender].exists,
      "Msg.sender is not registered identity"
    );
    require(
      identities[_issuer].exists,
      "Issuer is not registered identity"
    );
    require(
      identities[msg.sender].claimNonce == _nonce,
      "Invalid claim nonce"
    );

    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    address signer = _signature.recoverAddress(abi.encodePacked(
        msg.sender,
        _nonce,
        _issuer,
        _topic,
        _data
      ));

    require(
      AbstractIdentity(_issuer).memberHasPurpose(signer, _issuer) ||
      AbstractIdentity(_issuer).memberHasPurpose(signer, address(this)),
      "Invalid signature"
    );

    identities[msg.sender].claims[id].nonce = _nonce;
    identities[msg.sender].claims[id].issuer = _issuer;
    identities[msg.sender].claims[id].topic = _topic;
    identities[msg.sender].claims[id].data = _data;
    identities[msg.sender].claims[id].signature = _signature;

    ++identities[msg.sender].claimNonce;

    emit IdentityClaimAdded(msg.sender, _nonce, _issuer, _topic, _data, _signature);
  }

  /**
   * removes identity claim
   *
   * @param _issuer issuer contract address
   * @param _topic claim topic
   */
  function removeIdentityClaim(address _issuer, uint256 _topic) public {
    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    require(
      identities[msg.sender].claims[id].issuer == _issuer,
      "Identity claim doesn't exists"
    );

    delete identities[msg.sender].claims[id];

    emit IdentityClaimRemoved(msg.sender, _issuer, _topic);
  }
}
