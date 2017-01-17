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

const colors = [
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

const colorSHAs = colors.map((color) => web3.sha3(color));

module.exports = {
    fetchEvent, colors, colorSHAs
};
