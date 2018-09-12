pragma solidity ^0.4.24;

import "./abstract/SharedAccountInitialization.sol";
import "./SharedAccountMember.sol";

/**
 * Shared Account Initialization
 */
contract SharedAccountInitialization is AbstractSharedAccountInitialization, SharedAccountMember {

  constructor() internal {
    //
  }

  function initialize(address _member) public {
    address purpose = address(this);

    require(
      membersByPurpose[purpose].isEmpty(),
      "Account already initialized"
    );

    members[_member].purpose = purpose;
    members[_member].unlimited = true;

    membersByPurpose[purpose].push(_member);
  }
}
