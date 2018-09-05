pragma solidity ^0.4.24;

/*
 * Signature library
 */
library SignatureLib {

  function recoverAddress(bytes _self, bytes _message) public pure returns (address) {
    bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(_message)));

    bytes32 r;
    bytes32 s;
    uint8 v;

    if (_self.length != 65) {
      return (address(0));
    }

    assembly {
      r := mload(add(_self, 32))
      s := mload(add(_self, 64))
      v := byte(0, mload(add(_self, 96)))
    }

    if (v < 27) {
      v += 27;
    }

    if (v != 27 && v != 28) {
      return (address(0));
    } else {
      return ecrecover(hash, v, r, s);
    }
  }
}
