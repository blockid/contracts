pragma solidity ^0.4.24;

import "../libs/SignatureLib.sol";
import "./abstract/RegistryGuardian.sol";

/**
 * Registry Guardian
 */
contract RegistryGuardian is AbstractRegistryGuardian {

  using SignatureLib for bytes;

  modifier verifyGuardianSignature(bytes _message, bytes _signature) {
    address member = _signature.recoverAddress(_message);

    require(
      guardian.memberHasPurpose(member, address(this)),
      "Invalid guardian member"
    );

    _;
  }

  constructor() internal {
    //
  }
}