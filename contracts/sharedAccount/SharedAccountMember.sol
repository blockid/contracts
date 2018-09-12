pragma solidity ^0.4.24;

import "../libs/AddressArrayLib.sol";
import "./abstract/SharedAccountMember.sol";
import "./SharedAccountNonce.sol";

/**
 * Shared Account Member
 */
contract SharedAccountMember is AbstractSharedAccountMember, SharedAccountNonce {

  using AddressArrayLib for address[];

  struct Member {
    address purpose;
    uint256 limit;
    bool unlimited;
    address manager;
  }

  mapping(address => Member) members;
  mapping(address => address[]) membersByPurpose;

  modifier onlySelfPurpose(address _member) {
    require(
      memberHasPurpose(_member, address(this)),
      "Revert by onlySelfPurpose modifier"
    );
    _;
  }

  modifier onlySelfPurposeWithLimit(address _member) {
    require(
      (
      memberHasPurpose(_member, address(this)) &&
      verifyMemberLimit(_member, 1)
      ),
      "Revert by onlySelfPurposeWithLimit modifier"
    );
    _;
  }

  constructor() internal {
    //
  }

  function getMember(address _member) public view returns (address purpose, uint256 limit, bool unlimited, address manager) {
    purpose = members[_member].purpose;
    limit = members[_member].limit;
    unlimited = members[_member].unlimited;
    manager = members[_member].manager;
    return;
  }

  function getPurposeMembers(address _purpose) public view returns (address[]) {
    return membersByPurpose[_purpose];
  }

  function memberExists(address _member) public view returns (bool) {
    return members[_member].purpose != address(0);
  }

  function memberHasPurpose(address _member, address _purpose) public view returns (bool) {
    return members[_member].purpose == _purpose;
  }

  function verifyMemberLimit(address _member, uint256 _limit) public view returns (bool) {
    return memberExists(_member) && (members[_member].unlimited || members[_member].limit >= _limit);
  }

  function _addMember(address _sender, uint256 _nonce, address _member, address _purpose, uint256 _limit, bool _unlimited) internal onlySelfPurposeWithLimit(_sender) verifyNonce(_nonce) {
    require(
      !memberExists(_member),
      "Member already exists"
    );
    require(
      members[_sender].unlimited ||
      (
      !_unlimited &&
      members[_sender].limit >= _limit
      ),
      "Invalid sender limit"
    );
    require(
      !_unlimited || (_unlimited && _limit == 0),
      "Invalid limit"
    );

    membersByPurpose[_purpose].push(_member);

    members[_member].purpose = _purpose;
    members[_member].limit = _limit;
    members[_member].unlimited = _unlimited;

    address manager;

    if (!members[_sender].unlimited) {
      manager = _sender;
      members[_member].manager = manager;

      if (_limit > 0) {
        members[_sender].limit -= _limit;

        emit MemberLimitUpdated(_sender, _nonce, _sender, members[_sender].limit);
      }
    }

    emit MemberAdded(_sender, _nonce, _member, _purpose, _limit, _unlimited, manager);
  }

  function _updateMemberLimit(address _sender, uint256 _nonce, address _member, uint256 _limit) internal onlySelfPurpose(_sender) verifyNonce(_nonce) {
    require(
      memberExists(_member),
      "Member doesn't exists"
    );
    require(
      _limit != members[_member].limit &&
      !members[_member].unlimited,
      "Invalid member limit"
    );

    require(
      members[_sender].unlimited ||
      (
      members[_member].manager == _sender && // checks manager
      members[_sender].limit >= _limit - members[_member].limit
      ),
      "Invalid sender or sender limit"
    );

    address manager = members[_member].manager;

    if (manager != address(0)) {
      if (!memberExists(manager)) {
        // updates manager
        members[_member].manager = address(0);
        emit MemberManagerUpdated(_sender, _nonce, _member, address(0));
      } else {
        // updates manager limit
        members[manager].limit -= _limit - members[_member].limit;
        emit MemberLimitUpdated(_sender, _nonce, manager, members[manager].limit);
      }
    }

    members[_member].limit = _limit;

    emit MemberLimitUpdated(_sender, _nonce, _member, _limit);
  }

  function _removeMember(address _sender, uint256 _nonce, address _member) internal onlySelfPurpose(_sender) verifyNonce(_nonce) {
    require(
      memberExists(_member),
      "Member doesn't exists"
    );
    require(
      _sender != _member && (members[_sender].unlimited || _sender == members[_member].manager),
      "Invalid sender"
    );

    address manager = members[_member].manager;

    if (memberExists(manager)) {
      // updates manager limit
      members[manager].limit += members[_member].limit;
      emit MemberLimitUpdated(_sender, _nonce, manager, members[manager].limit);
    }

    membersByPurpose[members[_member].purpose].remove(_member);

    delete members[_member];

    emit MemberRemoved(_sender, _nonce, _member);
  }
}
