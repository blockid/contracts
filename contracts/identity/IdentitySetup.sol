pragma solidity ^0.4.24;

import "./abstract/IdentitySetup.sol";
import "./IdentityGasRelayed.sol";

/**
 * Identity Setup
 */
contract IdentitySetup is AbstractIdentitySetup, IdentityGasRelayed{

  bool called;

  constructor() internal {
    //
  }

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
