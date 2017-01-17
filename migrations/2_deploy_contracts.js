module.exports = function(deployer) {
    var colors = [
        "white",
        "silver",
        "gray",
        "black",
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

    var colorSHAs = [];

    for (var i = 0; i < colors.length; i++) {
        colorSHAs.push(web3.sha3(colors[i]));
    }

    deployer.deploy(RareGem, web3.sha3('purple'), colorSHAs);
};
