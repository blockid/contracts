pragma solidity ^0.4.24;

/**
 * Ownable
 */
contract Ownable {

  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(
      msg.sender == owner,
      "Revert by onlyOwner modifier"
    );
    _;
  }

  function renounceOwnership() public onlyOwner {
    owner = address(0);
  }

  function transferOwnership(address _owner) public onlyOwner {
    require(
      _owner != address(0),
      "Invalid owner"
    );

    owner = _owner;
  }
}