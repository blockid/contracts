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

    string memory header = "\x19Ethereum Signed Message:\n000000";

    uint256 length;
    uint256 lengthOffset;
    assembly {
      length := mload(_message)
      lengthOffset := add(header, 57)
    }

    require(
      length <= 999999,
      "Invalid message length"
    );

    uint256 lengthLength = 0;
    uint256 divisor = 100000;

    while (divisor != 0) {
      uint256 digit = length / divisor;

      if (digit == 0) {
        if (lengthLength == 0) {
          divisor /= 10;
          continue;
        }
      }

      lengthLength++;
      length -= digit * divisor;
      divisor /= 10;

      digit += 0x30;
      lengthOffset++;

      assembly {
        mstore8(lengthOffset, digit)
      }
    }

    if (lengthLength == 0) {
      lengthLength = 1 + 0x19 + 1;
    } else {
      lengthLength += 1 + 0x19;
    }

    assembly {
      mstore(header, lengthLength)
    }

    bytes32 hash = keccak256(abi.encodePacked(header, _message));

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
