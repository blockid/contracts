pragma solidity ^0.4.24;

/**
 * Abstract ENS
 */
contract AbstractENS {

  event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);
  event Transfer(bytes32 indexed node, address owner);
  event NewResolver(bytes32 indexed node, address resolver);
  event NewTTL(bytes32 indexed node, uint64 ttl);

  function owner(bytes32 _node) public constant returns (address);

  function resolver(bytes32 _node) public constant returns (address);

  function ttl(bytes32 _node) public constant returns (uint64);

  function setOwner(bytes32 _node, address _owner) public;

  function setSubnodeOwner(bytes32 _node, bytes32 _label, address _owner) public;

  function setResolver(bytes32 _node, address _resolver) public;

  function setTTL(bytes32 _node, uint64 _ttl) public;
}
