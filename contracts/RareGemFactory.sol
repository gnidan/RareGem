pragma solidity ^0.4.2;

import "./RareGem.sol";
import "./Colors.sol";

contract RareGemFactory {
    address colors;

    function RareGemFactory(address _colors) {
        colors = _colors;
    }

    function createRareGem(bytes32 _correctGuessHash)
        returns (address contractAddress)
    {
        RareGem rareGem = new RareGem(_correctGuessHash, colors);
        contractAddress = address(rareGem);

        rareGem.transfer(msg.sender);

        RareGemCreated(contractAddress, msg.sender);

        return contractAddress;
    }

    event RareGemCreated(address contractAddress, address creator);
}
