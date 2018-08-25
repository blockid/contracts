pragma solidity ^0.4.24;

import "./abstract/IdentityNonceHolder.sol";

/**
 * Identity Nonce Holder
 */
contract IdentityNonceHolder is AbstractIdentityNonceHolder {

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
