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

    mapping(string => bool) allowedGuesses;

    uint fee = 1 ether;

    event IncorrectGuess(string value);
    event CorrectGuess(string value);

    /*
     * Constructor
     */
    function RareGem(bytes32 _correctGuessHash)
        savingAllowedGuesses()
        ensureHashIsAllowedGuess(_correctGuessHash)
    {
        correctGuessHash = _correctGuessHash;
    }

    modifier savingAllowedGuesses() {
        // create fast lookup so that user transactions can be cheaper :0)
        for (uint i=0; i < colors.length; i++) {
            allowedGuesses[colors[i]] = true;
        }
        _;
    }

    modifier ensureHashIsAllowedGuess(bytes32 hash) {
        // no sense in mapping because only constructor needs to check hash
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
        if (!allowedGuesses[guess]) throw;
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
