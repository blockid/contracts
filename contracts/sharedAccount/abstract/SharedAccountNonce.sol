pragma solidity ^0.4.24;

/**
 * Abstract Shared Account Nonce
 */
contract AbstractSharedAccountNonce {

  event NonceUpdated(uint256 nonce);

  uint256 public nonce;
}
