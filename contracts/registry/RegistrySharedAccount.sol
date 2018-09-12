pragma solidity ^0.4.24;

import "../libs/AddressLib.sol";
import "../libs/SignatureLib.sol";
import "../sharedAccount/abstract/SharedAccount.sol";
import "./abstract/RegistrySharedAccount.sol";
import "./RegistryENS.sol";
import "./RegistryGuardian.sol";

/**
 * Registry Shared Account
 */
contract RegistrySharedAccount is AbstractRegistrySharedAccount, RegistryENS, RegistryGuardian {

  using AddressLib for address;
  using SignatureLib for bytes;

  mapping(address => bool) sharedAccounts;

  constructor() internal {
    //
  }

  function sharedAccountExists(address _sharedAccount) public view returns (bool) {
    return sharedAccounts[_sharedAccount];
  }

  function createSharedAccount(
    uint256 _salt,
    bytes32 _ensLabel,
    bytes32 _ensRootNode,
    bytes _memberMessageSignature,
    bytes _guardianMessageSignature
  ) public verifyGuardianSignature(_memberMessageSignature, _guardianMessageSignature) {

    require(
      _salt == 0,
      "Non zero salt is currently unsupported"
    );

    require(
      ensRootNodeExists(_ensRootNode),
      "ENS root node doesn't exists"
    );

    bytes32 ensNode = keccak256(abi.encodePacked(_ensRootNode, _ensLabel));

    require(
      ensResolver.addr(ensNode) == address(0),
      "ENS label already taken"
    );

    address member = _memberMessageSignature.recoverAddress(
      abi.encodePacked(
        address(this),
        _salt,
        _ensLabel,
        _ensRootNode
      )
    );

    address sharedAccount = address(guardian).cloneContract();

    AbstractSharedAccount(sharedAccount).initialize(member);

    ens.setSubnodeOwner(_ensRootNode, _ensLabel, address(this));
    ens.setResolver(ensNode, address(ensResolver));

    ensResolver.setAddr(ensNode, sharedAccount);

    sharedAccounts[sharedAccount] = true;

    emit SharedAccountCreated(sharedAccount, _ensLabel, _ensRootNode, member);
  }
}
