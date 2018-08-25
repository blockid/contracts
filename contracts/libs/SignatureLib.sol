pragma solidity ^0.4.24;

/*
 * Signature library
 */
library SignatureLib {

  function recoverAddress(bytes _self, bytes _message) public pure returns (address) {
    uint8 v;
    bytes32 r;
    bytes32 s;

    (v, r, s) = parseSignature(_self);

    bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(_message)));

    return ecrecover(hash, v, r, s);
  }

  function parseSignature(bytes _self) public pure returns (uint8 v, bytes32 r, bytes32 s) {
    require(
      _self.length == 65,
      "Invalid signature"
    );

    assembly {
      r := mload(add(_self, 32))
      s := mload(add(_self, 64))
      v := and(mload(add(_self, 65)), 0xff)
    }

    require(
      (
      v == uint8(27) ||
      v == uint8(28)
      ),
      "Invalid signature"
    );

    return;
  }
}
