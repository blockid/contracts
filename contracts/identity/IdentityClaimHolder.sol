pragma solidity ^0.4.24;

import "../libs/AddressLib.sol";
import "../libs/SignatureLib.sol";
import "./abstract/IdentityClaimHolder.sol";
import "./IdentityMemberHolder.sol";

/**
 * Identity Claim Holder
 */
contract IdentityClaimHolder is AbstractIdentityClaimHolder, IdentityMemberHolder {

  using AddressLib for address;
  using SignatureLib for bytes;

  struct Claim {
    address issuer;
    uint256 topic;
    bytes data;
    uint256 signingNonce;
    bytes signature;
  }

  mapping(bytes32 => Claim) claims;

  constructor() internal {
    //
  }

  // public view

  /**
   * gets claim by issuer and topic
   *
   * @param _issuer issuer contract address
   * @param _topic claim topic
   */
  function getClaim(address _issuer, uint256 _topic) public view returns (address issuer, uint256 topic, bytes data, uint256 signingNonce, bytes signature) {
    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    issuer = claims[id].issuer;
    topic = claims[id].topic;
    data = claims[id].data;
    signingNonce = claims[id].signingNonce;
    signature = claims[id].signature;

    return;
  }

  /**
   * checks if claim exists
   *
   * @param _issuer issuer contract address
   * @param _topic claim topic
   */
  function claimExists(address _issuer, uint256 _topic) public view returns (bool) {
    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    return claims[id].issuer == _issuer;
  }

  // public methods

  /**
   * adds claim
   *
   * @param _nonce current nonce
   * @param _issuer issuer contract address
   * @param _topic claim topic
   * @param _data claim data
   * @param _signature claim signature keccak256(address(this), _nonce, _issuer, _topic, _data))
   */
  function addClaim(uint256 _nonce, address _issuer, uint256 _topic, bytes _data, bytes _signature) public {
    _addClaim(msg.sender, _nonce, _issuer, _topic, _data, _signature);
  }

  /**
   * removes claim
   *
   * @param _nonce current nonce
   * @param _issuer issuer contract address
   * @param _topic claim topic
   */
  function removeClaim(uint256 _nonce, address _issuer, uint256 _topic) public {
    _removeClaim(msg.sender, _nonce, _issuer, _topic);
  }

  // internal methods

  function _addClaim(address _sender, uint256 _nonce, address _issuer, uint256 _topic, bytes _data, bytes _signature) internal onlySelfPurpose(_sender) verifyNonce(_nonce) {
    require(
      _issuer.isContract(),
      "Claim issuer is not a contract"
    );

    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    require(
      claims[id].issuer == address(0),
      "Claim already exists"
    );

    address signer = _signature.recoverAddress(abi.encodePacked(
        address(this),
        _nonce,
        _issuer,
        _topic,
        _data
      ));

    require(
      IdentityMemberHolder(_issuer).memberHasPurpose(signer, _issuer),
      "Invalid claim signature"
    );

    claims[id].issuer = _issuer;
    claims[id].topic = _topic;
    claims[id].data = _data;
    claims[id].signingNonce = _nonce;
    claims[id].signature = _signature;

    emit ClaimAdded(_sender, _nonce, _issuer, _topic, _data, _signature);
  }

  function _removeClaim(address _sender, uint256 _nonce, address _issuer, uint256 _topic) internal onlySelfPurpose(_sender) verifyNonce(_nonce) {
    bytes32 id = keccak256(abi.encodePacked(_issuer, _topic));

    require(
      claims[id].issuer == _issuer,
      "Claim doesn't exists"
    );

    delete claims[id];

    emit ClaimRemoved(_sender, _nonce, _issuer, _topic);
  }
}
