pragma solidity ^0.4.24;

import "../libs/AddressArrayLib.sol";
import "./abstract/IdentityMemberHolder.sol";
import "./IdentityNonceManager.sol";

/**
 * Identity Member Holder
 */
contract IdentityMemberHolder is AbstractIdentityMemberHolder, IdentityNonceManager {

  using AddressArrayLib for address[];

  struct Member {
    address purpose;
    uint256 limit;
    bool limited;
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

  constructor() internal {
    //
  }

  // public view

  /**
   * gets member by member address
   *
   * @param _member member address
   */
  function getMember(address _member) public view returns (address purpose, uint256 limit, bool limited) {
    purpose = members[_member].purpose;
    limit = members[_member].limit;
    limited = members[_member].limited;
    return;
  }

  /**
   * gets member addresses by purpose contract address
   *
   * @param _purpose purpose contract address
   */
  function getPurposeMembers(address _purpose) public view returns (address[]) {
    return membersByPurpose[_purpose];
  }

  /**
   * checks if member exists
   *
   * @param _member member address
   */
  function memberExists(address _member) public view returns (bool) {
    return members[_member].purpose != address(0);
  }

  /**
   * checks if member has contract purpose
   *
   * @param _member member address
   * @param _purpose purpose contract address
   */
  function memberHasPurpose(address _member, address _purpose) public view returns (bool) {
    return members[_member].purpose == _purpose;
  }

  /**
   * verifies member limit
   *
   * @param _member member address
   * @param _limit limit
   */
  function verifyMemberLimit(address _member, uint256 _limit) public view returns (bool) {
    return memberExists(_member) && (!members[_member].limited || members[_member].limit >= _limit);
  }

  // public methods

  /**
   * adds member
   *
   * @param _nonce current nonce
   * @param _member member address
   * @param _purpose purpose contract address
   * @param _limit member limit
   */
  function addMember(uint256 _nonce, address _member, address _purpose, uint256 _limit) public {
    _addMember(msg.sender, _nonce, _member, _purpose, _limit);
  }

  /**
   * updates member limit
   *
   * @param _nonce current nonce
   * @param _member member address
   * @param _limit member limit
   */
  function updateMemberLimit(uint256 _nonce, address _member, uint256 _limit) public {
    _updateMemberLimit(msg.sender, _nonce, _member, _limit);
  }

  /**
   * removes member
   *
   * @param _nonce current nonce
   * @param _member member address
   */
  function removeMember(uint256 _nonce, address _member) public {
    _removeMember(msg.sender, _nonce, _member);
  }

  // internal methods

  function _addMember(address _sender, uint256 _nonce, address _member, address _purpose, uint256 _limit) internal onlySelfPurpose(_sender) verifyNonce(_nonce) {
    require(
      !memberExists(_member),
      "Member already exists"
    );
    require(
      !members[_sender].limited || (_limit > 0 && members[_sender].limit >= _limit),
      "Invalid sender limit"
    );

    membersByPurpose[_purpose].push(_member);

    members[_member].purpose = _purpose;
    members[_member].limit = _limit;
    members[_member].limited = _limit > 0;

    if (members[_sender].limited) {
      members[_member].manager = _sender;

      members[_sender].limit -= _limit;

      emit MemberLimitUpdated(_sender, _nonce, _sender, members[_sender].limit);
    }

    emit MemberAdded(_sender, _nonce, _member, _purpose, _limit);
  }

  function _updateMemberLimit(address _sender, uint256 _nonce, address _member, uint256 _limit) internal onlySelfPurpose(_sender) verifyNonce(_nonce) {
    require(
      memberExists(_member),
      "Member doesn't exists"
    );
    require(
      _limit != members[_member].limit && members[_member].limited,
      "Invalid member limit"
    );

    if (!members[_sender].limited) {
      members[_member].manager = address(0); // reset manager
    } else {
      require(
        members[_member].manager == _sender,
        "Sender is not member manager"
      );

      if (_limit > members[_member].limit) {
        uint limitDiff = _limit - members[_member].limit;

        require(
          verifyMemberLimit(_sender, limitDiff),
          "Invalid sender limit"
        );

        members[_sender].limit -= limitDiff;
      } else {
        members[_sender].limit += members[_member].limit - _limit;
      }

      emit MemberLimitUpdated(_sender, _nonce, _sender, members[_sender].limit);
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
      _sender != _member,
      "Can not remove member"
    );

    if (members[_member].manager == _sender) {
      members[_sender].limit += members[_member].limit;
      emit MemberLimitUpdated(_sender, _nonce, _sender, members[_sender].limit);
    }

    membersByPurpose[members[_member].purpose].remove(_member);

    delete members[_member];

    emit MemberRemoved(_sender, _nonce, _member);
  }
}
