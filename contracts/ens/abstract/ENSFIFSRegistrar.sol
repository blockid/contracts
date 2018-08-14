pragma solidity ^0.4.24;

/**
 * Abstract ENS FIFS registrar
 */
contract AbstractENSFIFSRegistrar {

  function register(bytes32 _label, address _subOwner) public;
}
