pragma solidity ^0.4.24;

import "./SharedAccountInitialization.sol";
import "./SharedAccountMember.sol";
import "./SharedAccountNonce.sol";
import "./SharedAccountSignedRefunded.sol";
import "./SharedAccountTransaction.sol";

/**
 * Abstract Shared Account
 */
contract AbstractSharedAccount is AbstractSharedAccountInitialization, AbstractSharedAccountMember, AbstractSharedAccountNonce, AbstractSharedAccountSignedRefunded, AbstractSharedAccountTransaction {

}
