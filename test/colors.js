require('mocha-generators').install();

var { colorSHAs } = require('./helpers');

contract('Colors', function(accounts) {
    it("should be deployable", function* () {
        var colors = yield Colors.new(
            colorSHAs, {from: accounts[0]}
        );

        var valid = yield colors.isValid.call("purple");
        assert.equal(valid, true);

        var invalid = yield colors.isValid.call("sandwiches");
        assert.equal(invalid, false);
    });
})
