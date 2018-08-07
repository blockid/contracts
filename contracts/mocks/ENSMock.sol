pragma solidity ^0.4.24;

import "../ens/abstract/ENS.sol";

/**
 * ENS Mock
 */
contract ENSMock is AbstractENS {

  struct Record {
    address owner;
    address resolver;
    uint64 ttl;
  }

  mapping(bytes32 => Record) records;

  modifier onlyOwner(bytes32 node) {
    require(
      records[node].owner == msg.sender,
      "Revert by onlyOwner modifier"
    );
    _;
  }

  constructor() public {
    records[0x0].owner = msg.sender;
  }

  function owner(bytes32 _node) public constant returns (address) {
    return records[_node].owner;
  }

  function resolver(bytes32 _node) public constant returns (address) {
    return records[_node].resolver;
  }

  function ttl(bytes32 _node) public constant returns (uint64) {
    return records[_node].ttl;
  }

  function setOwner(bytes32 _node, address _owner) public onlyOwner(_node) {
    emit Transfer(_node, _owner);

    records[_node].owner = _owner;
  }

  function setSubnodeOwner(bytes32 _node, bytes32 _label, address _owner) public onlyOwner(_node) {
    bytes32 subnode = keccak256(abi.encodePacked(_node, _label));

    emit NewOwner(_node, _label, _owner);

    records[subnode].owner = _owner;
  }

  function setResolver(bytes32 _node, address _resolver) public onlyOwner(_node) {
    emit NewResolver(_node, _resolver);

    records[_node].resolver = _resolver;
  }

  function setTTL(bytes32 _node, uint64 _ttl) public onlyOwner(_node) {
    emit NewTTL(_node, _ttl);

    records[_node].ttl = _ttl;
  }
}
