pragma solidity ^0.4.24;

import "./abstract/Identity.sol";
import "./IdentityGasRelayed.sol";

/**
 * Identity
 */
contract Identity is AbstractIdentity, IdentityGasRelayed {

  /**
   * adds first member
   *
   * @param _member first member address
   */
  function addFirstMember(address _member) public {
    address purpose = address(this);

    require(
      membersByPurpose[purpose].length == 0,
      "Method already called"
    );

    members[_member].purpose = purpose;
    members[_member].limited = false;

    membersByPurpose[purpose].push(_member);
  }
}
