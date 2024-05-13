import { task } from "hardhat/config";
require("dotenv").config();
import fs from "fs";

interface ContractInteractions {
  contractName: string;
  address: string;
}

const contracts: ContractInteractions[] = [
  {
    contractName: "ZKWillyNFT",
    address: process.env.PUBLIC_NFT_CONTRACT_ADDRESS!,
  },
];

task("startMint", "Calls startMint on the ZKWillyNFT contract").setAction(
  async (args, hre) => {
    const contractConfig = contracts.find(
      (c) => c.contractName === "ZKWillyNFT"
    );
    if (!contractConfig) {
      console.error("Contract not found: ZKWillyNFT");
      return;
    }

    const ZKWillyNFT = await hre.ethers.getContractFactory("ZKWillyNFT");
    const contract = ZKWillyNFT.attach(contractConfig.address);

    try {
      await contract.startMint({ gasLimit: 2000000000 });
      console.log("startMint called");
    } catch (error) {
      console.error(error);
    }
  }
);

task("withdraw", "Calls withdraw on the ZKWillyNFT contract").setAction(
  async (args, hre) => {
    const contractConfig = contracts.find(
      (c) => c.contractName === "ZKWillyNFT"
    );
    if (!contractConfig) {
      console.error("Contract not found: ZKWillyNFT");
      return;
    }

    const ZKWillyNFT = await hre.ethers.getContractFactory("ZKWillyNFT");
    const contract = ZKWillyNFT.attach(contractConfig.address);

    try {
      await contract.withdraw({ gasLimit: 2000000000 });
      console.log("withdraw called");
    } catch (error) {
      console.error(error);
    }
  }
);

task(
  "getWhaleCounts",
  "Returns grouped counts of whale types minted"
).setAction(async (args, hre) => {
  // Contract Setup
  const contractConfig = contracts.find((c) => c.contractName === "ZKWillyNFT");
  if (!contractConfig) {
    console.error("Contract not found: ZKWillyNFT");
    return;
  }

  const ZKWillyNFT = await hre.ethers.getContractFactory("ZKWillyNFT");
  const contract = ZKWillyNFT.attach(contractConfig.address);

  // 1. Get Number of Tokens Minted
  const totalMinted = await contract.getTotalTokenCount();
  console.log("Total NFTs minted:", totalMinted);

  // 2. Loop and Retrieve Whale Types
  const whaleCounts = {};
  for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
    // Start at tokenId 1
    const whaleType = await contract.getWhaleType(tokenId);
    const whaleTypeString = whaleType.toString(); // For indexing in the count object

    if (whaleCounts[whaleTypeString]) {
      whaleCounts[whaleTypeString]++;
    } else {
      whaleCounts[whaleTypeString] = 1;
    }
  }

  // 3. Display Grouped Whale Counts
  console.log("\nWhale Type Counts:");
  for (const whaleType in whaleCounts) {
    console.log(whaleType, ":", whaleCounts[whaleType]);
  }
});

task(
  "getTokenHolders",
  "Returns an array of all token holder addresses"
).setAction(async (args, hre) => {
  // Contract Setup (same as your other tasks)
  const contractConfig = contracts.find((c) => c.contractName === "ZKWillyNFT");
  if (!contractConfig) {
    console.error("Contract not found: ZKWillyNFT");
    return;
  }

  const ZKWillyNFT = await hre.ethers.getContractFactory("ZKWillyNFT");
  const contract = ZKWillyNFT.attach(contractConfig.address);

  // Get Total Number of Tokens Minted
  const totalMinted = await contract.getTotalTokenCount();
  console.log("Total NFTs minted:", totalMinted);

  // Fetch Token Holders
  const tokenHolders = [];
  for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
    try {
      const owner = await contract.ownerOf(tokenId);
      tokenHolders.push(owner); // Add to the array only if owner exists
    } catch (error) {
      // Handle cases where the tokenId doesn't exist yet (optional)
      // You might want to log this or simply continue to the next tokenId
      console.warn(`No owner found for tokenId ${tokenId}`);
    }
  }

  // Log Results
  fs.writeFileSync("token_holders.json", JSON.stringify(tokenHolders, null, 2));
  console.log("Token holder addresses saved to token_holders.json");
});
