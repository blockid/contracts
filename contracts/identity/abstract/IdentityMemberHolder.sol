pragma solidity ^0.4.24;

/**
 * Abstract Identity
 */
contract AbstractIdentityMemberHolder {

  // events

  event MemberAdded(address sender, uint256 nonce, address member, address purpose, uint256 limit);
  event MemberLimitUpdated(address sender, uint256 nonce, address member, uint256 limit);
  event MemberRemoved(address sender, uint256 nonce, address member);

  // methods

  function getMember(address _member) public view returns (address purpose, uint256 limit, bool limited);

  function getPurposeMembers(address _purpose) public view returns (address[]);

  function memberExists(address _member) public view returns (bool);

  function memberHasPurpose(address _member, address _purpose) public view returns (bool);

  function verifyMemberLimit(address _member, uint256 _limit) public view returns (bool);

  function addMember(uint256 _nonce, address _member, address _purpose, uint256 _limit) public;

  function updateMemberLimit(uint256 _nonce, address _member, uint256 _limit) public;

  function removeMember(uint256 _nonce, address _member) public;
}
