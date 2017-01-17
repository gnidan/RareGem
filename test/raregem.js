require('mocha-generators').install();

var { fetchEvent, colorSHAs } = require('./helpers');

contract('RareGem', function(accounts) {
    it("should allow owner withdrawal", function* () {
        var rareGem = RareGem.deployed();

        var owner = accounts[0];
        var player = accounts[1];

        var amount = web3.toWei(web3.toBigNumber('3'), 'ether');
        var balanceBefore = web3.eth.getBalance(owner);

        yield rareGem.guess.sendTransaction('gray', {
            from: player, value: amount
        });

        yield rareGem.withdraw.sendTransaction({from: owner});

        assert.isAtLeast(
            // current balance
            web3.eth.getBalance(owner),

            // previous balance plus player's guess fee,
            // minus 1 ether for fees.
            balanceBefore.plus(amount).minus(
                web3.toWei('1', 'ether')
            )
        );

        // contract should be empty
        assert.equal(
            web3.eth.getBalance(rareGem.address).toString(),
            web3.toWei('0', 'ether').toString()
        );
    });

    it("should prevent non-owner withdrawal", function* () {
        var rareGem = RareGem.deployed();

        var owner = accounts[0];
        var player = accounts[1];
        var hacker = accounts[2];

        var amount = web3.toWei(web3.toBigNumber('1'), 'ether');
        var balanceBefore = web3.eth.getBalance(hacker);

        yield rareGem.guess.sendTransaction('silver', {
            from: player, value: amount
        })

        var exception = undefined;

        try {
            yield rareGem.withdraw.sendTransaction({
                from: hacker
            })
        } catch (e) {
            assert.isBelow(
                // current balance
                web3.eth.getBalance(hacker),

                // previous balance plus player's guess fee,
                // minus 1 ether for fees.
                balanceBefore
            );

            // contract should not be empty
            assert.equal(
                web3.eth.getBalance(rareGem.address).toString(),
                amount.toString()
            );

            exception = e;
        }

        assert.isDefined(exception);
    });

    it("should require a fee of 1 ether", function* () {
        var rareGem = RareGem.deployed();

        var account = accounts[0];

        var invalid = web3.toWei('0.9', 'ether');

        var exception = undefined;
        try {
            yield rareGem.guess.sendTransaction('blue', {
                from: account, value: invalid
            })
        } catch (e) {
            exception = e;
        }

        assert.isDefined(exception);
    });

    it("should only accept colors", function* () {
        var rareGem = RareGem.deployed();
        var account = accounts[0];

        var exception = undefined;
        try {
            yield rareGem.guess.sendTransaction('strange', {
                from: account, value: web3.toWei('1.0', 'ether')
            });
        } catch(e) {
            exception = e;
        }

        assert.isDefined(exception);
    });

    it("should reject guesses that have already been made", function* () {
        var rareGem = RareGem.deployed();

        var account = accounts[0];

        var fee = web3.toWei('1.00', 'ether');

        yield rareGem.guess.sendTransaction('purple', {
            from: account, value: fee
        });

        var exception = undefined;
        try {
            yield rareGem.guess.sendTransaction({
                from: account, value: 'purple'
            });
        } catch (e) {
            exception = e;
        }

        assert.isDefined(exception);
    });

    it("should trigger IncorrectGuess", function* () {
        var correctAnswer = 'purple';
        var wrongAnswer = 'green';

        var rareGem = yield RareGem.new(
            web3.sha3(correctAnswer), colorSHAs, {from: accounts[0]}
        );

        yield rareGem.guess.sendTransaction(wrongAnswer, {
            from: accounts[0], value: web3.toWei('1', 'ether')
        });

        var log = yield fetchEvent(rareGem.allEvents());

        assert.equal(
            log.event, "IncorrectGuess", "Event should be CorrectGuess"
        );
    });

    it("should trigger CorrectGuess", function* () {
        var answer = 'purple';

        var rareGem = yield RareGem.new(
            web3.sha3(answer), colorSHAs, {from: accounts[0]}
        );

        yield rareGem.guess.sendTransaction(answer, {
            from: accounts[0], value: web3.toWei('1', 'ether')
        });

        var log = yield fetchEvent(rareGem.allEvents());

        assert.equal(
            log.event, "CorrectGuess", "Event should be CorrectGuess"
        );
    });

    it("should error if there's been a winner", function* () {
        var answer = 'purple';

        var rareGem = yield RareGem.new(
            web3.sha3(answer), colorSHAs,
            {from: accounts[0]}
        );

        yield rareGem.guess.sendTransaction(answer, {
            from: accounts[0], value: web3.toWei('1', 'ether')
        });

        var exception = undefined;
        try {
            yield rareGem.guess.sendTransaction(answer, {
                from: accounts[0], value: web3.toWei('1', 'ether')
            })
        } catch (e) {
            exception = e;
        }

        assert.isDefined(exception);
    });
});
