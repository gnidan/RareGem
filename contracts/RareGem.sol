pragma solidity ^0.4.2;

import "./Owned.sol";
import "./Colors.sol";

contract RareGem is Owned {
    Colors colors;

    address public winner;

    bytes32 correctGuessHash;

    mapping(string => bool) priorGuesses;

    uint fee = 1 ether;

    event IncorrectGuess(string value);
    event CorrectGuess(string value);

    /*
     * Constructor
     */
    function RareGem(bytes32 _correctGuessHash, address _colorsAddress)
        ensureHashIsAllowedGuess(_correctGuessHash)
    {
        correctGuessHash = _correctGuessHash;
        colors = Colors(_colorsAddress);
    }

    modifier ensureHashIsAllowedGuess(bytes32 hash) {
        _;

        if (!colors.isValidHash(hash)) throw;
    }

    /*
     * Main public interface
     */
    function guess(string guess)
        savingGuess(guess)
        onlyNewGuesses(guess)
        onlyAllowedGuesses(guess)
        requireFee
        notWonYet
        payable
    {
        if (sha3(guess) == correctGuessHash) {
            winner = msg.sender;
            CorrectGuess(guess);
        } else {
            IncorrectGuess(guess);
        }
    }

    modifier notWonYet() {
        if (winner != 0x0) throw;
        _;
    }

    modifier requireFee() {
        if (msg.value < fee) throw;
        _;
    }

    modifier onlyAllowedGuesses(string guess) {
        if (!colors.isValid(guess)) throw;
        _;
    }

    modifier onlyNewGuesses(string guess) {
        if (priorGuesses[guess]) throw;
        _;
    }

    modifier savingGuess(string guess) {
        _;
        priorGuesses[guess] = true;
    }

    function withdraw() onlyOwner returns (bool) {
        return owner.send(this.balance);
    }

    event DebugUint(uint value);
    event DebugBytes(bytes32 value);
}
