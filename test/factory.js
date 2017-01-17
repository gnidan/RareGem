require('mocha-generators').install();

var { fetchEvent, colorSHAs } = require('./helpers');

contract('RareGemFactory', function(accounts) {
    it("should create contracts", function* () {
        var factory = RareGemFactory.deployed();

        yield factory.createRareGem.sendTransaction(
            web3.sha3("purple"), colorSHAs, {from: accounts[0]}
        );

        var log = yield fetchEvent(factory.allEvents());

        assert.equal(log.event, "RareGemCreated");
    });

    it("should create contracts with correct ownership", function* () {
        var factory = RareGemFactory.deployed();

        yield factory.createRareGem.sendTransaction(
            web3.sha3("purple"), colorSHAs, {from: accounts[0]}
        );

        var log = yield fetchEvent(factory.allEvents());

        assert.equal(log.event, "RareGemCreated");

        var rareGem = RareGem.at(log.args.contractAddress);

        var owner = yield rareGem.owner();

        assert.equal(owner, accounts[0]);
    });
});
