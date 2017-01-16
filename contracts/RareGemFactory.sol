pragma solidity ^0.4.2;

import "./RareGem.sol";

contract RareGemFactory {
    function createRareGem(bytes32 _correctGuessHash)
        returns (address contractAddress)
    {
        RareGem rareGem = new RareGem(_correctGuessHash);
        contractAddress = address(rareGem);

        rareGem.transfer(msg.sender);

        RareGemCreated(contractAddress, msg.sender);

        return contractAddress;
    }

    event RareGemCreated(address contractAddress, address creator);
}
