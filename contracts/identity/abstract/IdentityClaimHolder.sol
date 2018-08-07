pragma solidity ^0.4.24;

/**
 * Abstract Identity Claim Holder
 */
contract AbstractIdentityClaimHolder {

  // events

  event ClaimAdded(address sender, uint256 nonce, address issuer, uint256 topic, bytes data, bytes signature);
  event ClaimRemoved(address sender, uint256 nonce, address issuer, uint256 topic);

  // methods

  function getClaim(address _issuer, uint256 _topic) public view returns (address issuer, uint256 topic, bytes data, uint256 signingNonce, bytes signature);

  function claimExists(address _issuer, uint256 _topic) public view returns (bool);

  function addClaim(uint256 _nonce, address _issuer, uint256 _topic, bytes _data, bytes _signature) public;

  function removeClaim(uint256 _nonce, address _issuer, uint256 _topic) public;
}
