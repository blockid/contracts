pragma solidity ^0.4.24;

/**
 * Abstract Shared Account Transaction
 */
contract AbstractSharedAccountTransaction {

  event TransactionExecuted(address sender, uint256 nonce, address to, uint256 value, bytes data, bool succeeded);

  function() public payable;
}
