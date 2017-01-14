contract('RareGem', function(accounts) {
    it("should allow owner withdrawal", function(done) {
        var rareGem = RareGem.deployed();

        var owner = accounts[0];
        var player = accounts[1];

        var amount = web3.toWei(web3.toBigNumber('5'), 'ether');
        var balanceBefore = web3.eth.getBalance(owner);

        return rareGem.guess.sendTransaction('gray', {
            from: player, value: amount
        }).then(function () {
            rareGem.withdraw.sendTransaction({
                from: owner
            }).then(function () {
                assert.isAtLeast(
                    // current balance
                    web3.eth.getBalance(owner).toString(),

                    // previous balance plus player's guess fee,
                    // minus 1 ether for fees.
                    balanceBefore.plus(amount).minus(
                        web3.toWei('1', 'ether')
                    ).toString()
                );

                // contract should be empty
                assert.equal(
                    web3.eth.getBalance(rareGem.address).toString(),
                    web3.toWei('0', 'ether').toString()
                );

                done();
            })
        });
    });

    it("should prevent non-owner withdrawal", function(done) {
        var rareGem = RareGem.deployed();

        var owner = accounts[0];
        var player = accounts[1];
        var hacker = accounts[2];

        var amount = web3.toWei(web3.toBigNumber('5'), 'ether');
        var balanceBefore = web3.eth.getBalance(hacker);

        return rareGem.guess.sendTransaction('silver', {
            from: player, value: amount
        }).then(function () {
            rareGem.withdraw.sendTransaction({
                from: hacker
            }).catch(function (result) {
                assert.isBelow(
                    // current balance
                    web3.eth.getBalance(hacker).toString(),

                    // previous balance plus player's guess fee,
                    // minus 1 ether for fees.
                    balanceBefore.toString()
                );

                // contract should not be empty
                assert.equal(
                    web3.eth.getBalance(rareGem.address).toString(),
                    amount.toString()
                );

                done();
            });
        });
    });

    it("should require a fee of 1 ether", function(done) {
        var rareGem = RareGem.deployed();

        var account = accounts[0];

        var invalid = web3.toWei('0.9', 'ether');

        return rareGem.guess.sendTransaction('blue', {
            from: account, value: invalid
        }).catch(function (result) {
            done();
        });
    });

    it("should only accept colors", function(done) {
        var rareGem = RareGem.deployed();
        var account = accounts[0];

        return rareGem.guess.sendTransaction('strange', {
            from: account, value: web3.toWei('1.0', 'ether')
        }).catch(function (result) {
            done();
        });

    });

    it("should reject guesses that have already been made", function(done) {
        var rareGem = RareGem.deployed();

        var account = accounts[0];

        var fee = web3.toWei('1.00', 'ether');

        return rareGem.guess.sendTransaction('purple', {
            from: account, value: fee
        }).then(function () {
            return rareGem.guess.sendTransaction({
                from: account, value: 'purple'
            })
        }).catch(function (result) {
            done();
        });
    });

    it("should trigger IncorrectGuess", function(done) {
        var correctAnswer = 'purple';
        var wrongAnswer = 'green';

        return RareGem.new(
            web3.sha3(correctAnswer), {from: accounts[0]}
        ).then(function (rareGem) {
            return rareGem.guess.sendTransaction(wrongAnswer, {
                from: accounts[0], value: web3.toWei('1', 'ether')
            }).then(function () {
                var events = rareGem.allEvents();

                return new Promise(function (resolve, reject) {
                    events.watch(function(error, log) { resolve(log, done) });
                })
            }).then(function(log, done) {
                assert.equal(
                    log.event, "IncorrectGuess", "Event should be CorrectGuess"
                );
            }).then(done).catch(done);
        });
    });

    it("should trigger CorrectGuess", function(done) {
        var answer = 'purple';

        return RareGem.new(
            web3.sha3(answer), {from: accounts[0]}
        ).then(function (rareGem) {
            return rareGem.guess.sendTransaction(answer, {
                from: accounts[0], value: web3.toWei('1', 'ether')
            }).then(function () {
                var events = rareGem.allEvents();

                return new Promise(function (resolve, reject) {
                    events.watch(function(error, log) { resolve(log, done) });
                })
            }).then(function(log, done) {
                assert.equal(
                    log.event, "CorrectGuess", "Event should be CorrectGuess"
                );
            }).then(done).catch(done);
        });
    });

    it("should error if there's been a winner", function(done) {
        var answer = 'purple';

        var rareGem;

        RareGem.new(web3.sha3(answer), {from: accounts[0]}).then(function(result) {
            rareGem = result;
        }).then(function () {
            return rareGem.guess.sendTransaction(answer, {
                from: accounts[0], value: web3.toWei('1', 'ether')
            })
        }).then(function () {
            return rareGem.guess.sendTransaction(answer, {
                from: accounts[0], value: web3.toWei('1', 'ether')
            })
        }).catch(function() {
            done();
        });
    });
});
