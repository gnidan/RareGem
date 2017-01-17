module.exports = function(deployer) {
    var colors = Colors.deployed().address;

    deployer.deploy(RareGemFactory, colors);
    deployer.deploy(RareGem, web3.sha3("purple"), colors);
};

