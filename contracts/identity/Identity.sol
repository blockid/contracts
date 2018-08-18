pragma solidity ^0.4.24;

import "./abstract/Identity.sol";
import "./IdentityGasRelayed.sol";

/**
 * Identity
 */
contract Identity is AbstractIdentity, IdentityGasRelayed {

  bool called;

  /**
   * adds first member
   *
   * @param _member first member address
   */
  function addFirstMember(address _member) public {
    require(
      !called,
      "Method already called"
    );

    called = true;

    address purpose = address(this);

    members[_member].purpose = purpose;
    members[_member].unlimited = true;

    membersByPurpose[purpose].push(_member);
  }
}
