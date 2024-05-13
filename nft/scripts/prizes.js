const fs = require("fs");

function getRandomAddressesFromFile(filePath, count = 27) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const addresses = JSON.parse(data);

        // Handle cases where the file has fewer addresses than requested
        if (addresses.length < count) {
          console.warn(
            `The file only contains ${addresses.length} addresses. Returning all of them.`
          );
          resolve(addresses); // Return all available addresses
          return;
        }

        const randomAddresses = [];
        const usedIndices = new Set();

        while (randomAddresses.length < count) {
          const randomIndex = Math.floor(Math.random() * addresses.length);
          if (!usedIndices.has(randomIndex)) {
            randomAddresses.push(addresses[randomIndex]);
            usedIndices.add(randomIndex);
          }
        }

        resolve(randomAddresses);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

const addressFilePath = "../token_holders.json"; // Replace with your actual path
getRandomAddressesFromFile(addressFilePath).then((randomAddress) => {
  if (randomAddress) {
    console.log(randomAddress);
  }
});
