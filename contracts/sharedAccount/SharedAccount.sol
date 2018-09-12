pragma solidity ^0.4.24;

import "./SharedAccountInitialization.sol";
import "./SharedAccountSignedRefunded.sol";

/**
 * Shared Account
 */
contract SharedAccount is SharedAccountInitialization, SharedAccountSignedRefunded {

  constructor() public {
    //
  }
}
