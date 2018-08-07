pragma solidity ^0.4.24;

import "./abstract/IdentityTransactionManager.sol";
import "./IdentityMemberHolder.sol";

/**
 * Identity Transaction Manager
 */
contract IdentityTransactionManager is AbstractIdentityTransactionManager, IdentityMemberHolder {

  constructor() internal {
    //
  }

  // public methods

  function() public payable {
    //
  }

  /**
   * executes transaction
   *
   * @param _nonce current nonce
   * @param _to recipient address
   * @param _value transaction value
   * @param _data transaction data
   */
  function executeTransaction(uint256 _nonce, address _to, uint256 _value, bytes _data) public {
    _executeTransaction(msg.sender, _nonce, _to, _value, _data);
  }

  // internal methods

  function _executeTransaction(address _sender, uint256 _nonce, address _to, uint256 _value, bytes _data) internal verifyNonce(_nonce) {
    require(
      _to != address(0) && _to != address(this),
      "Invalid recipient"
    );
    require(
      memberHasPurpose(_sender, address(this)) || memberHasPurpose(_sender, _to),
      "Invalid sender purpose"
    );
    require(
      verifyMemberLimit(_sender, _value),
      "Invalid sender limit"
    );

    bool succeeded = _to.call.value(_value)(_data);

    if (succeeded && _value > 0 && members[_sender].limited) {
      members[_sender].limit -= _value;

      emit MemberLimitUpdated(_sender, _nonce, _sender, members[_sender].limit);
    }

    emit TransactionExecuted(_sender, _nonce, _to, _value, _data, succeeded);
  }
}
