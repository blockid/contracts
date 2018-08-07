pragma solidity ^0.4.24;

/**
 * Identity Nonce Manager
 */
contract IdentityNonceManager {

  uint256 public nonce;

  modifier verifyNonce(uint256 _nonce) {
    require(
      _nonce == nonce,
      "Invalid nonce"
    );

    _;

    ++nonce;
  }

  constructor() internal {
    //
  }
}
