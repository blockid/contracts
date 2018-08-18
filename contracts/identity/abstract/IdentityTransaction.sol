pragma solidity ^0.4.24;

/**
 * Abstract Identity Transaction
 */
contract AbstractIdentityTransaction {

  // events

  event TransactionExecuted(address sender, uint256 nonce, address to, uint256 value, bytes data, bool succeeded);

  // methods

  function() public payable;

  function executeTransaction(uint256 _nonce, address _to, uint256 _value, bytes _data) public;
}
