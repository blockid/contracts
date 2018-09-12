pragma solidity ^0.4.24;

import "./abstract/SharedAccountNonce.sol";

/**
 * Shared Account Nonce
 */
contract SharedAccountNonce is AbstractSharedAccountNonce {

  modifier verifyNonce(uint256 _nonce) {
    require(
      _nonce == nonce,
      "Invalid nonce"
    );

    _;

    emit NonceUpdated(++nonce);
  }

  constructor() internal {
    //
  }
}
