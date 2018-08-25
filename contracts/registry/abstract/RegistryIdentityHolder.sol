pragma solidity ^0.4.24;

/**
 * Abstract Registry Identity Holder
 */
contract AbstractRegistryIdentityHolder {

  // events

  event IdentityCreated(address identity, address member, bytes32 ensLabel, bytes32 ensRootNode);
  event IdentityClaimAdded(address identity, uint256 nonce, address issuer, uint256 topic, bytes data, bytes signature);
  event IdentityClaimRemoved(address identity, address issuer, uint256 topic);

  // methods

  function identityExists(address _identity) public view returns (bool);

  function getIdentityClaimNonce(address _identity) public view returns (uint256);

  function getIdentityClaim(address _identity, address _issuer, uint256 _topic) public view returns (uint256 nonce, address issuer, uint256 topic, bytes data, bytes signature);

  function identityClaimExists(address _identity, address _issuer, uint256 _topic) public view returns (bool);

  function createIdentity(bytes32 _ensLabel, bytes32 _ensRootNode, bytes _messageSignature) public;

  function createSelfIdentity(bytes32 _ensLabel, bytes32 _ensRootNode) public;

  function addIdentityClaim(uint256 _nonce, address _issuer, uint256 _topic, bytes _data, bytes _signature) public;

  function removeIdentityClaim(address _issuer, uint256 _topic) public;
}
