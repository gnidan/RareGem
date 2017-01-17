pragma solidity ^0.4.2;

import "./RareGem.sol";

contract RareGemFactory {
    function createRareGem(bytes32 _correctGuessHash,
                           bytes32[] _allowedGuessHashes)
        returns (address contractAddress)
    {
        RareGem rareGem = new RareGem(_correctGuessHash, _allowedGuessHashes);
        contractAddress = address(rareGem);

        rareGem.transfer(msg.sender);

        RareGemCreated(contractAddress, msg.sender);

        return contractAddress;
    }

    event RareGemCreated(address contractAddress, address creator);
}
