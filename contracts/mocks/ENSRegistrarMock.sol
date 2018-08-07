pragma solidity ^0.4.24;

import "../ownership/Ownable.sol";
import "../ens/abstract/ENS.sol";

/**
 * ENS Registrar Mock
 */
contract ENSRegistrarMock is Ownable {

  AbstractENS public ens;
  bytes32 public rootNode;

  constructor(AbstractENS _ens, bytes32 _rootNode) public {
    ens = _ens;
    rootNode = _rootNode;
  }

  function register(bytes32 _label, address _subOwner) public onlyOwner {
    ens.setSubnodeOwner(rootNode, _label, _subOwner);
  }
}
