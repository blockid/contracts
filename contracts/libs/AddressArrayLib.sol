pragma solidity ^0.4.24;

/*
 * Address Array Lib
 */
library AddressArrayLib {

  function isEmpty(address[] storage _self) public view returns (bool) {
    return _self.length == uint(0);
  }

  function contains(address[] storage _self, address _value) public view returns (bool) {
    return indexOf(_self, _value) != uint(- 1);
  }

  function indexOf(address[] storage _self, address _value) public view returns (uint) {
    for (uint i = 0; i < _self.length; i++) {

      if (_self[i] == _value) {
        return i;
      }
    }

    return uint(- 1);
  }

  function remove(address[] storage _self, address _value) public returns (bool success) {
    uint index = indexOf(_self, _value);

    success = index != uint(- 1);

    if (success) {
      delete _self[index];

      uint lastIndex = _self.length - 1;
      if (lastIndex != uint(0)) {
        _self[index] = _self[lastIndex];
        delete _self[lastIndex];
      }

      _self.length = lastIndex;
    }

    return;
  }
}