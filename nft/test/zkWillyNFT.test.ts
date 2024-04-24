import { expect } from "chai";
import deploy from "../deploy/deploy";
import { Contract, Wallet, Provider } from "zksync-ethers";
import {
  getWallet,
  deployContract,
  LOCAL_RICH_WALLETS,
  getRandomWallet,
} from "../deploy/utils";
import { whaleTypes } from "../deploy/helperConfig";
import * as hre from "hardhat";
import { ethers } from "ethers";

describe("ZKWillyNFT Minting", function () {
  let nftContract: Contract;
  let deployerWallet: Wallet;

  before(async function () {
    ({ contract: nftContract, wallet: deployerWallet } = await deploy());
  });

  it("Should mint a new NFT to the recipient", async function () {
    const tx = await nftContract.mintNFT({
      value: ethers.parseEther("0.1"),
    });
    await tx.wait();
    const balance = await nftContract.balanceOf(deployerWallet.address);
    expect(balance).to.equal(BigInt("1"));
  });

  it("It shouldn't mint a new NFT if the recipient doesn't send enough ETH", async function () {
    await expect(
      nftContract.mintNFT({
        value: ethers.parseEther("0.00001"),
      })
    ).to.be.revertedWithCustomError(
      nftContract,
      "ZKWillyNFT__NotEnoughETHSent"
    );
  });

  it("Should have correct token URI after minting", async function () {
    const tokenId = 1; // Assuming the first token minted has ID 1
    const tokenURI = await nftContract.tokenURI(tokenId);
    expect(tokenURI).to.equal(
      "ipfs://bafybeibix2lvq7m4tsv7wjebeezzqqyn4dcsxclnd2wu43r2nnmayq2qr4/"
    );
  });

  it("Should allow owner to mint multiple NFTs", async function () {
    const tx1 = await nftContract.mintNFT({
      value: ethers.parseEther("0.1"),
    });
    await tx1.wait();
    const tx2 = await nftContract.mintNFT({
      value: ethers.parseEther("0.1"),
    });
    await tx2.wait();
    const balance = await nftContract.balanceOf(deployerWallet.address);
    expect(balance).to.equal(BigInt("3")); // 1 initial nft + 2 minted
  });

  it("should have approximately 10% shiny NFTs", async function () {
    this.timeout(120000); // Increase timeout to 2 minutes

    const numberOfTests = 30;
    let shinyCount = 0;

    for (let i = 0; i < numberOfTests; i++) {
      const tx = await nftContract.mintNFT({
        value: ethers.parseEther("0.1"),
      });
      await tx.wait();
    }

    // Now lets check if they are shiny

    for (let i = 1; i <= numberOfTests; i++) {
      console.log(`Checking whale type for token ID ${i}`);
      const whaleType = await nftContract.getWhaleType(i);
      console.log(`Whale type: ${whaleType}`);
      const tokenURI = await nftContract.tokenURI(i);
      console.log(`Token URI: ${tokenURI}`);
      if (isShiny(whaleType)) {
        shinyCount++;
      }
    }

    const proportion = shinyCount / numberOfTests;
    expect(proportion).to.be.closeTo(0.1, 0.1);

    function isShiny(type) {
      // Convert type to BigInt for comparison if necessary
      // Assuming that 'type' might be returning as a BigInt from the blockchain
      return BigInt(type) % BigInt(2) === BigInt(1);
    }
  });
});

describe("ZKWillyNFT Boundry Test", function () {
  let nftContract: Contract;
  let deployerWallet: Wallet;

  before(async function () {
    ({ contract: nftContract, wallet: deployerWallet } = await deploy());
  });

  const testCases = [
    { balance: "0.109", expectedTypes: ["PLANKTON", "SHINY_PLANKTON"] },
    { balance: "0.2", expectedTypes: ["SHRIMP", "SHINY_SHRIMP"] },
    { balance: "0.4", expectedTypes: ["PUFFERFISH", "SHINY_PUFFERFISH"] },
    { balance: "0.9", expectedTypes: ["DOLPHIN", "SHINY_DOLPHIN"] },
    { balance: "2", expectedTypes: ["BELUGA_WHALE", "SHINY_BELUGA_WHALE"] },
    { balance: "4", expectedTypes: ["NARWHAL", "SHINY_NARWHAL"] },
    { balance: "9", expectedTypes: ["ORCA", "SHINY_ORCA"] },
    {
      balance: "19",
      expectedTypes: ["HUMPBACK_WHALE", "SHINY_HUMPBACK_WHALE"],
    },
    { balance: "80", expectedTypes: ["SPEM_WHALE", "SHINY_SPERM_WHALE"] },
    { balance: "200", expectedTypes: ["BLUE_WHALE", "SHINY_BLUE_WHALE"] },
  ];

  for (let testCase of testCases) {
    it(`Should mint a ${testCase.expectedTypes.join(" OR ")} NFT with ${
      testCase.balance
    } ETH`, async function () {
      const testAccount = getRandomWallet();

      console.log(
        `Testing with ${
          testCase.balance
        } ETH, expected types: ${testCase.expectedTypes.join(" OR ")}`
      );

      console.log(`Deployer balance: ${await deployerWallet.getBalance()}`);

      console.log(
        `Test account balance before transaction: ${await testAccount.getBalance()}`
      );

      const initTx = await deployerWallet.sendTransaction({
        to: testAccount.address,
        value: ethers.parseEther(testCase.balance),
      });

      await initTx.wait();

      console.log(
        `Test account balance after transaction: ${await testAccount.getBalance()}`
      );

      const tx = await nftContract
        .connect(testAccount)
        //@ts-ignore
        .mintNFT({ value: ethers.parseEther("0.1") });

      await tx.wait();

      const latestTokenId = await nftContract.getTotalTokenCount();

      console.log(`Token ID: ${latestTokenId}`);

      const owner = await nftContract.ownerOf(latestTokenId);

      console.log(`Owner of token ID ${latestTokenId}: ${owner}`);
      console.log(`Test account address: ${testAccount.address}`);

      const whaleType = await nftContract.getWhaleType(latestTokenId);

      console.log(`Whale type: ${whaleType}`);

      const readableType = whaleTypes[whaleType];
      expect(testCase.expectedTypes).to.include(readableType);
    });
  }
});
