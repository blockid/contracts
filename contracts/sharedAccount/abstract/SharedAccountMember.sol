pragma solidity ^0.4.24;

/**
 * Abstract Shared Account Member
 */
contract AbstractSharedAccountMember {

  event MemberAdded(address sender, uint256 nonce, address indexed member, address purpose, uint256 limit, bool unlimited, address manager);
  event MemberLimitUpdated(address sender, uint256 nonce, address indexed member, uint256 limit);
  event MemberManagerUpdated(address sender, uint256 nonce, address indexed member, address manager);
  event MemberRemoved(address sender, uint256 nonce, address indexed member);

  function getMember(address _member) public view returns (address purpose, uint256 limit, bool unlimited, address manager);

  function getPurposeMembers(address _purpose) public view returns (address[]);

  function memberExists(address _member) public view returns (bool);

  function memberHasPurpose(address _member, address _purpose) public view returns (bool);

  function verifyMemberLimit(address _member, uint256 _limit) public view returns (bool);
}
