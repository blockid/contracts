pragma solidity ^0.4.24;

import "../libs/SignatureLib.sol";
import "./abstract/IdentityGasRelayed.sol";
import "./IdentityClaimHolder.sol";
import "./IdentityTransaction.sol";

/**
 * Identity Gas Relayed
 */
contract IdentityGasRelayed is AbstractIdentityGasRelayed, IdentityClaimHolder, IdentityTransaction {

  using SignatureLib for bytes;

  modifier gasRelayed(uint256 _extraGas) {
    uint startGas = gasleft();

    _;

    if (_extraGas > 0) {
      uint256 amount = (startGas - gasleft() + _extraGas) * tx.gasprice;

      require(msg.sender.call.gas(0).value(amount)());
    }
  }

  constructor() internal {
    //
  }

  // public methods

  /**
   * adds member (gas relayed version)
   *
   * @param _nonce current nonce
   * @param _member member address
   * @param _purpose purpose contract address
   * @param _limit member limit
   * @param _unlimited member is unlimited
   * @param _extraGas transaction gas limit
   * @param _messageSignature transaction message signature
   */
  function gasRelayedAddMember(
    uint256 _nonce,
    address _member,
    address _purpose,
    uint256 _limit,
    bool _unlimited,
    uint256 _extraGas,
    bytes _messageSignature
  ) public gasRelayed(_extraGas) {

    address messageSigner = _messageSignature.recoverAddress(abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _member,
        _purpose,
        _limit,
        _unlimited,
        _extraGas,
        tx.gasprice
      ));

    _addMember(messageSigner, _nonce, _member, _purpose, _limit, _unlimited);
  }

  /**
   * updates member limit (gas relayed version)
   *
   * @param _nonce current nonce
   * @param _member member address
   * @param _limit member limit
   * @param _extraGas transaction gas limit
   * @param _messageSignature transaction message signature
   */
  function gasRelayedUpdateMemberLimit(
    uint256 _nonce,
    address _member,
    uint256 _limit,
    uint256 _extraGas,
    bytes _messageSignature
  ) public gasRelayed(_extraGas) {

    address messageSigner = _messageSignature.recoverAddress(abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _member,
        _limit,
        _extraGas,
        tx.gasprice
      ));

    _updateMemberLimit(messageSigner, _nonce, _member, _limit);
  }

  /**
   * removes member (gas relayed version)
   *
   * @param _nonce current nonce
   * @param _member member address
   * @param _extraGas transaction gas limit
   * @param _messageSignature transaction message signature
   */
  function gasRelayedRemoveMember(
    uint256 _nonce,
    address _member,
    uint256 _extraGas,
    bytes _messageSignature
  ) public gasRelayed(_extraGas) {

    address messageSigner = _messageSignature.recoverAddress(abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _member,
        _extraGas,
        tx.gasprice
      ));

    _removeMember(messageSigner, _nonce, _member);
  }

  /**
   * adds claim (gas relayed version)
   *
   * @param _nonce current nonce
   * @param _issuer issuer contract address
   * @param _topic claim topic
   * @param _data claim data
   * @param _signature claim signature keccak256(address(this), _issuer, _topic, _data))
   * @param _extraGas transaction gas limit
   * @param _messageSignature transaction message signature
   */
  function gasRelayedAddClaim(
    uint256 _nonce,
    address _issuer,
    uint256 _topic,
    bytes _data,
    bytes _signature,
    uint256 _extraGas,
    bytes _messageSignature
  ) public gasRelayed(_extraGas) {

    address messageSigner = _messageSignature.recoverAddress(abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _issuer,
        _topic,
        _data,
        _signature,
        _extraGas,
        tx.gasprice
      ));

    _addClaim(messageSigner, _nonce, _issuer, _topic, _data, _signature);
  }

  /**
   * removes claim (gas relayed version)
   *
   * @param _nonce current nonce
   * @param _issuer issuer contract address
   * @param _topic claim topic
   * @param _extraGas transaction gas limit
   * @param _messageSignature transaction message signature
   */
  function gasRelayedRemoveClaim(
    uint256 _nonce,
    address _issuer,
    uint256 _topic,
    uint256 _extraGas,
    bytes _messageSignature
  ) public gasRelayed(_extraGas) {

    address messageSigner = _messageSignature.recoverAddress(abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _issuer,
        _topic,
        _extraGas,
        tx.gasprice
      ));

    _removeClaim(messageSigner, _nonce, _issuer, _topic);
  }

  /**
   * executes transaction (gas relayed version)
   *
   * @param _nonce current nonce
   * @param _to recipient address
   * @param _value transaction value
   * @param _data transaction data
   * @param _extraGas transaction gas limit
   * @param _messageSignature transaction message signature
   */
  function gasRelayedExecuteTransaction(
    uint256 _nonce,
    address _to,
    uint256 _value,
    bytes _data,
    uint256 _extraGas,
    bytes _messageSignature
  ) public gasRelayed(_extraGas) {

    address messageSigner = _messageSignature.recoverAddress(abi.encodePacked(
        address(this),
        msg.sig,
        _nonce,
        _to,
        _value,
        _data,
        _extraGas,
        tx.gasprice
      ));

    _executeTransaction(messageSigner, _nonce, _to, _value, _data);
  }
}
