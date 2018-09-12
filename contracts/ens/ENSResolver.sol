pragma solidity ^0.4.24;

import "./abstract/ENS.sol";

/**
 * ENS Resolver
 */
contract ENSResolver {

  event AddrChanged(bytes32 indexed node, address a);
  event ABIChanged(bytes32 indexed node, uint256 indexed contentType);

  struct Record {
    address addr;
    mapping(uint256 => bytes) abis;
  }

  bytes4 constant INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
  bytes4 constant ADDR_INTERFACE_ID = bytes4(keccak256("addr(bytes32)"));
  bytes4 constant ABI_INTERFACE_ID = bytes4(keccak256("ABI(bytes32,uint256)"));

  AbstractENS ens;

  mapping(bytes32 => Record) records;

  modifier onlyOwner(bytes32 _node) {
    require(
      ens.owner(_node) == msg.sender,
      "Revert by onlyOwner modifier"
    );
    _;
  }

  constructor(AbstractENS _ens) public {
    ens = _ens;
  }

  function supportsInterface(bytes4 _id) public pure returns (bool) {
    return _id == INTERFACE_META_ID ||
    _id == ADDR_INTERFACE_ID ||
    _id == ABI_INTERFACE_ID;
  }

  function addr(bytes32 _node) public constant returns (address) {
    return records[_node].addr;
  }

  function setAddr(bytes32 _node, address _addr) public onlyOwner(_node) {
    records[_node].addr = _addr;
    emit AddrChanged(_node, _addr);
  }

  function ABI(bytes32 _node, uint256 _contentTypes) public constant returns (uint256 contentType, bytes data) {
    Record storage record = records[_node];

    for (contentType = 1; contentType <= _contentTypes; contentType <<= 1) {
      if ((contentType & _contentTypes) != 0 && record.abis[contentType].length > 0) {
        data = record.abis[contentType];
        return;
      }
    }
    contentType = 0;
  }

  function setABI(bytes32 _node, uint256 _contentTypes, bytes _data) public onlyOwner(_node) {
    require(
      ((_contentTypes - 1) & _contentTypes) == 0,
      "Invalid _contentTypes"
    );

    records[_node].abis[_contentTypes] = _data;

    emit ABIChanged(_node, _contentTypes);
  }
}
