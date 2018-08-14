pragma solidity ^0.4.24;

import "../ens/abstract/ENS.sol";
import "../ens/abstract/ENSFIFSRegistrar.sol";

/**
 * ENS Registrar Mock
 */
contract ENSRegistrarMock is AbstractENSFIFSRegistrar {

  AbstractENS public ens;
  bytes32 public rootNode;

  modifier onlyOwner(bytes32 _label) {
    address currentOwner = ens.owner(keccak256(abi.encodePacked(rootNode, _label)));

    require(
      currentOwner == address(0) || currentOwner == msg.sender,
      "Revert by onlyOwner modifier"
    );
    _;
  }

  constructor(AbstractENS _ens, bytes32 _rootNode) public {
    ens = _ens;
    rootNode = _rootNode;
  }

  function register(bytes32 _label, address _subOwner) public onlyOwner(_label) {
    ens.setSubnodeOwner(rootNode, _label, _subOwner);
  }
}
