pragma solidity ^0.4.2;

contract RareGem {
    string[16] public colors = [
        "white",
        "silver",
        "gray",
        "black"
        "red",
        "maroon",
        "yellow",
        "olive",
        "lime",
        "green",
        "aqua",
        "teal",
        "blue",
        "navy",
        "fuchsia",
        "purple"
    ];

    address public winner;

    bytes32 correctGuessHash;
    mapping(string => bool) priorGuesses;

    uint fee = 1 ether;

    event IncorrectGuess(string value);
    event CorrectGuess(string value);

    function RareGem(bytes32 _correctGuessHash)
        onlyColorHashes(_correctGuessHash)
    {
        correctGuessHash = _correctGuessHash;
    }

    function guess(string guess)
        savingGuess(guess)
        onlyNewGuesses(guess)
        onlyColors(guess)
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

    modifier onlyNewGuesses(string guess) {
        if (priorGuesses[guess]) {
            throw;
        }
        _;
    }

    modifier requireFee() {
        if (msg.value < fee) throw;
        _;
    }

    modifier savingGuess(string guess) {
        _;
        priorGuesses[guess] = true;
    }

    modifier onlyColors(string guess) {
        bool found = false;
        for (uint i = 0; i < colors.length; i++) {
            if (stringsEqual(colors[i], guess)) {
                found = true;
                break;
            }
        }
        if (!found) throw;
        _;
    }

    modifier onlyColorHashes(bytes32 hash) {
        bool found = false;
        for (uint i = 0; i < colors.length; i++) {
            if (sha3(colors[i]) == hash) {
                found = true;
                break;
            }
        }
        if (!found) throw;
        _;
    }

    function stringsEqual(string storage _a, string memory _b)
        internal
        returns (bool)
    {
        /* copied from
         * https://forum.ethereum.org/discussion/3238/string-compare-in-solidity
         */
        bytes storage a = bytes(_a);
        bytes memory b = bytes(_b);
        if (a.length != b.length)
            return false;
        // @todo unroll this loop
        for (uint i = 0; i < a.length; i ++)
            if (a[i] != b[i])
                return false;
        return true;
    }

    event DebugUint(uint value);
    event DebugBytes(bytes32 value);
}
