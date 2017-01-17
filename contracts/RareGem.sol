pragma solidity ^0.4.2;

import "./Owned.sol";

contract RareGem is Owned {
    address public winner;

    bytes32 correctGuessHash;
    mapping(bytes32 => bool) allowedGuessHashes;

    mapping(string => bool) priorGuesses;

    uint fee = 1 ether;

    event IncorrectGuess(string value);
    event CorrectGuess(string value);

    /*
     * Constructor
     */
    function RareGem(bytes32 _correctGuessHash, bytes32[] _allowedGuessHashes)
        ensureHashIsAllowedGuess(_correctGuessHash, _allowedGuessHashes)
    {
        correctGuessHash = _correctGuessHash;
        for (uint i = 0; i < _allowedGuessHashes.length; i++) {
            allowedGuessHashes[_allowedGuessHashes[i]] = true;
        }
    }

    modifier ensureHashIsAllowedGuess(bytes32 hash, bytes32[] allowed) {
        // no sense in mapping because only constructor needs to check hash
        bool found = false;
        for (uint i = 0; i < allowed.length; i++) {
            if (allowed[i] == hash) {
                found = true;
                break;
            }
        }
        if (!found) throw;
        _;
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
        if (!allowedGuessHashes[sha3(guess)]) throw;
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
