module.exports = function(deployer) {
    deployer.deploy(RareGem, web3.sha3('purple'));
};
