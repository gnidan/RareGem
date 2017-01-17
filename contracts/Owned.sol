pragma solidity ^0.4.2;

contract Owned {
    address public owner;

    modifier onlyOwner {
        if (msg.sender != owner)
            throw;
        _;
    }

    function Owned() {
        owner = msg.sender;
    }

    function transfer(address _owner) onlyOwner {
        owner = _owner;
    }
}
