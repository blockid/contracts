pragma solidity ^0.4.24;

/**
 * Abstract Shared Account Signed Refunded
 */
contract AbstractSharedAccountSignedRefunded {

  event GasRefunded(address recipient, uint256 gasAmount, uint256 gasPrice);

  function addMember(
    uint256 _nonce,
    address _member,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public;

  function updateMemberLimit(
    uint256 _nonce,
    address _member,
    uint256 _limit,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public;

  function removeMember(
    uint256 _nonce,
    address _member,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public;

  function executeTransaction(
    uint256 _nonce,
    address _to,
    uint256 _value,
    bytes _data,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public;
}
