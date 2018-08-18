pragma solidity ^0.4.24;

/**
 * Identity Nonce
 */
contract IdentityNonce {

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
