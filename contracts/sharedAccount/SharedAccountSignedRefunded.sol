pragma solidity ^0.4.24;

import "../libs/SignatureLib.sol";
import "./abstract/SharedAccountSignedRefunded.sol";
import "./SharedAccountMember.sol";
import "./SharedAccountTransaction.sol";

/**
 * Shared Account Signed Refunded
 */
contract SharedAccountSignedRefunded is AbstractSharedAccountSignedRefunded, SharedAccountMember, SharedAccountTransaction {

  using SignatureLib for bytes;

  modifier gasRefund(uint256 _refundGasBase) {
    if (_refundGasBase > 0) {
      uint startGas = gasleft();

      _;

      uint256 amount = (startGas - gasleft() + _refundGasBase) * tx.gasprice;

      require(
        msg.sender.call.gas(0).value(amount)(),
        "Can't refund used gas"
      );
    } else {
      _;
    }
  }

  constructor() internal {
    //
  }

  function addMember(
    uint256 _nonce,
    address _member,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public gasRefund(_refundGasBase) {

    address signer = _refundGasBase == 0 && _messageSignature.length == 0
    ? msg.sender
    : _messageSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _member,
        _purpose,
        _limit,
        _unlimited,
        _refundGasBase,
        tx.gasprice
      )
    );

    _addMember(signer, _nonce, _member, _purpose, _limit, _unlimited);
  }

  function updateMemberLimit(
    uint256 _nonce,
    address _member,
    uint256 _limit,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public gasRefund(_refundGasBase) {

    address signer = _refundGasBase == 0 && _messageSignature.length == 0
    ? msg.sender
    : _messageSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _member,
        _limit,
        _refundGasBase,
        tx.gasprice
      )
    );

    _updateMemberLimit(signer, _nonce, _member, _limit);
  }

  function removeMember(
    uint256 _nonce,
    address _member,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public gasRefund(_refundGasBase) {

    address signer = _refundGasBase == 0 && _messageSignature.length == 0
    ? msg.sender
    : _messageSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _member,
        _refundGasBase,
        tx.gasprice
      )
    );

    _removeMember(signer, _nonce, _member);
  }

  function executeTransaction(
    uint256 _nonce,
    address _to,
    uint256 _value,
    bytes _data,
    uint256 _refundGasBase,
    bytes _messageSignature
  ) public gasRefund(_refundGasBase) {

    address signer = _refundGasBase == 0 && _messageSignature.length == 0
    ? msg.sender
    : _messageSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _to,
        _value,
        _data,
        _refundGasBase,
        tx.gasprice
      )
    );

    _executeTransaction(signer, _nonce, _to, _value, _data);
  }
}
