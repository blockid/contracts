pragma solidity ^0.4.24;

import "./IdentityNonceHolder.sol";
import "./IdentityMemberHolder.sol";
import "./IdentityTransaction.sol";
import "./IdentityGasRelayed.sol";
import "./IdentitySetup.sol";

/**
 * Abstract Identity
 */
contract AbstractIdentity is AbstractIdentityNonceHolder, AbstractIdentityMemberHolder, AbstractIdentityTransaction, AbstractIdentityGasRelayed, AbstractIdentitySetup {
  //
}
