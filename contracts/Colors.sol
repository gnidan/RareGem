pragma solidity ^0.4.2;

import "./Owned.sol";

contract Colors is Owned {
    mapping(bytes32 => bool) knownColorHashes;

    function Colors(bytes32[] _knownColorHashes) {
        for (uint i = 0; i < _knownColorHashes.length; i++) {
            addColorHash(_knownColorHashes[i]);
        }
    }

    function addColorHash(bytes32 _colorHash) onlyOwner {
        knownColorHashes[_colorHash] = true;
    }

    function isValid(string _color) constant external returns (bool) {
        return knownColorHashes[sha3(_color)];
    }

    function isValidHash(bytes32 _colorHash) constant external returns (bool) {
        return knownColorHashes[_colorHash];
    }
}
