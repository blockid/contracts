pragma solidity ^0.4.24;

/**
 * Abstract Identity Gas Relayed
 */
contract AbstractIdentityGasRelayed {

  // methods

  function gasRelayedAddMember(
    uint256 _nonce,
    address _member,
    address _purpose,
    uint256 _limit,
    uint256 _extraGas,
    bytes _messageSignature
  ) public;

  function gasRelayedUpdateMemberLimit(
    uint256 _nonce,
    address _member,
    uint256 _limit,
    uint256 _extraGas,
    bytes _messageSignature
  ) public;

  function gasRelayedRemoveMember(
    uint256 _nonce,
    address _member,
    uint256 _extraGas,
    bytes _messageSignature
  ) public;

  function gasRelayedAddClaim(
    uint256 _nonce,
    address _issuer,
    uint256 _topic,
    bytes _data,
    bytes _signature,
    uint256 _extraGas,
    bytes _messageSignature
  ) public;

  function gasRelayedRemoveClaim(
    uint256 _nonce,
    address _issuer,
    uint256 _topic,
    uint256 _extraGas,
    bytes _messageSignature
  ) public;

  function gasRelayedExecuteTransaction(
    uint256 _nonce,
    address _to,
    uint256 _value,
    bytes _data,
    uint256 _extraGas,
    bytes _messageSignature
  ) public;
}
