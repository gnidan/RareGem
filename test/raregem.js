require('mocha-generators').install();

function fetchEvent(events) {
    return new Promise((resolve, reject) => {
        events.watch((error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

contract('RareGem', function(accounts) {
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
            web3.sha3(correctAnswer), {from: accounts[0]}
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
            web3.sha3(answer), {from: accounts[0]}
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

        var rareGem = yield RareGem.new(web3.sha3(answer), {from: accounts[0]});

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
