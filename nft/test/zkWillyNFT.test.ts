import { expect } from "chai";
import deploy from "../deploy/deploy";
import { Contract, Provider, Wallet } from "zksync-ethers";
import {
  getWallet,
  deployContract,
  LOCAL_RICH_WALLETS,
  getRandomWallet,
  getProvider,
} from "../deploy/utils";
import { whaleTypes } from "../deploy/helperConfig";
import hre from "hardhat";
import { ethers } from "ethers";

describe("ZKWillyNFT Minting", function () {
  let nftContract: Contract;
  let deployerWallet: Wallet;

  before(async function () {
    ({ contract: nftContract, wallet: deployerWallet } = await deploy());
    await nftContract.startMint();
  });

  it("Should mint a new NFT to the recipient if enough ETH sent", async function () {
    //Work out $21 in ETH if the price of ETH is $4000

    // 21 / 4000 = 0.00525

    const tx = await nftContract.mintNFT({
      value: ethers.parseEther("0.00525"),
    });
    await tx.wait();
    const balance = await nftContract.balanceOf(deployerWallet.address);
    expect(balance).to.equal(BigInt("1"));
  });

  it("It shouldn't mint a new NFT if the recipient doesn't send enough ETH", async function () {
    //Work out $19 in ETH if the price of ETH is $4000

    // 19 / 4000 = 0.00475

    await expect(
      nftContract.mintNFT({
        value: ethers.parseEther("0.00475"),
      })
    ).to.be.revertedWithCustomError(
      nftContract,
      "ZKWillyNFT__NotEnoughETHSent"
    );
  });

  // it("Testing $1", async function () {
  //   //ETH is $4000
  //   //$1 worth of ETH is 0.00025
  //   const tx = await nftContract.mintNFT({
  //     value: ethers.parseEther("0.0003"),
  //   });
  //   await tx.wait();
  //   const balance = await nftContract.balanceOf(deployerWallet.address);
  //   expect(balance).to.equal(BigInt("1"));
  // });

  it("Should have correct token URI after minting", async function () {
    const whaleType = await nftContract.getWhaleType(1);
    const readableType = whaleTypes[whaleType];
    const expectedTypes = ["BLUE_WHALE", "SHINY_BLUE_WHALE"];

    expect(expectedTypes).to.include(readableType);
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
      const whaleType = await nftContract.getWhaleType(i);
      const tokenURI = await nftContract.tokenURI(i);
      if (isShiny(whaleType)) {
        shinyCount++;
      }
    }

    const proportion = shinyCount / numberOfTests;
    expect(proportion).to.be.closeTo(0.1, 0.1);

    function isShiny(type) {
      return BigInt(type) % BigInt(2) === BigInt(1);
    }
  });
});

describe("ZKWillyNFT Boundry Test", function () {
  let nftContract: Contract;
  let deployerWallet: Wallet;

  before(async function () {
    ({ contract: nftContract, wallet: deployerWallet } = await deploy());
    await nftContract.startMint();
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

      const initTx = await deployerWallet.sendTransaction({
        to: testAccount.address,
        value: ethers.parseEther(testCase.balance),
      });

      await initTx.wait();

      const tx = await nftContract
        .connect(testAccount)
        //@ts-ignore
        .mintNFT({ value: ethers.parseEther("0.1") });

      await tx.wait();

      const latestTokenId = await nftContract.getTotalTokenCount();

      const owner = await nftContract.ownerOf(latestTokenId);
      const whaleType = await nftContract.getWhaleType(latestTokenId);

      const readableType = whaleTypes[whaleType];
      expect(testCase.expectedTypes).to.include(readableType);
    });
  }
});

describe("ZKWillyNFT Limit Test", function () {
  let nftContract: Contract;
  let deployerWallet: Wallet;

  before(async function () {
    //TODO, figure out how to deploy with only 10 limit

    ({ contract: nftContract, wallet: deployerWallet } = await deploy());
    await nftContract.startMint();
  });

  it("Should only mint the maximum number of tokens", async function () {
    for (let i = 0; i < 10; i++) {
      const tx = await nftContract.mintNFT({
        value: ethers.parseEther("0.1"),
      });
      await tx.wait();
    }

    await expect(
      nftContract.mintNFT({
        value: ethers.parseEther("0.1"),
      })
      //@ts-ignore
    ).to.be.revertedWithCustomError(nftContract, "ZKWillyNFT__MaxTokensMinted");
  });
});

// describe("ZKWillyNFT Golden Willy Test", function () {
//   let nftContract: Contract;
//   let deployerWallet: Wallet;

//   before(async function () {
//     ({ contract: nftContract, wallet: deployerWallet } = await deploy());
//     await nftContract.startMint();
//   });

//   it("should have approximately 1% Golden Willy NFTs", async function () {
//     this.timeout(0); // No Timeout

//     const numberOfTests = 500;
//     let goldenWillyCount = 0;

//     for (let i = 0; i < numberOfTests; i++) {
//       console.log("Minting NFT: ", i + 1);
//       const tx = await nftContract.mintNFT({
//         value: ethers.parseEther("0.1"),
//       });
//       await tx.wait();

//       const latestTokenId = await nftContract.getTotalTokenCount();

//       const whaleType = await nftContract.getWhaleType(latestTokenId);
//       const readableType = whaleTypes[whaleType];
//       if (readableType === "GOLDEN_WILLY") {
//         console.log("GOLDEN WILLY FOUND");
//         goldenWillyCount++;
//       }
//     }

//     const proportion = goldenWillyCount / numberOfTests;

//     console.log(
//       `Golden Willy's minted ${goldenWillyCount} times out of ${numberOfTests} tests. Proportion: ${proportion}`
//     );
//     expect(proportion).to.be.closeTo(0.01, 0.01);
//   });
// });

describe("ZKWillyNFT Mint Duration Test", function () {
  let nftContract: Contract;
  let deployerWallet: Wallet;
  let provider: Provider;

  before(async function () {
    ({ contract: nftContract, wallet: deployerWallet } = await deploy());
    provider = getProvider();
  });

  it("Should not mint if the mint hasnt started yet", async function () {
    await expect(
      nftContract.mintNFT({
        value: ethers.parseEther("0.1"),
      })
    ).to.be.revertedWithCustomError(nftContract, "ZKWillyNFT__MintNotStarted");
  });

  it("Should not let a random person start the mint", async function () {
    const randomWallet = getRandomWallet();

    await expect(
      //@ts-ignore
      nftContract.connect(randomWallet).startMint()
    ).to.be.reverted;
  });

  it("Should let the owner start the mint", async function () {
    await expect(nftContract.startMint()).to.emit(nftContract, "MintStarted");
  });

  it("Should let you mint after the mint has started", async function () {
    //Log the block timestamp

    let currentTimeStamp: number = await (
      await provider.getBlock("latest")
    ).timestamp;

    console.log("Current TimeStamp: ", currentTimeStamp);

    const tx = await nftContract.mintNFT({
      value: ethers.parseEther("0.1"),
    });
    await tx.wait();
    const balance = await nftContract.balanceOf(deployerWallet.address);
    expect(balance).to.equal(BigInt("1"));
  });
});

describe("ZKWillyNFT Mint End Test And Withdraw", function () {
  let nftContract: Contract;
  let deployerWallet: Wallet;
  let provider: Provider;
  let balance: ethers.BigNumberish;

  before(async function () {
    ({ contract: nftContract, wallet: deployerWallet } = await deploy(
      30,
      ethers.parseUnits("1.0", "ether").toString()
    ));
    provider = getProvider();
    balance = await deployerWallet.getBalance();
  });

  it("Should start the mint", async function () {
    await expect(nftContract.startMint()).to.emit(nftContract, "MintStarted");
  });

  it("Should end after 30 seconds", async function () {
    let richWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    await expect(
      //@ts-ignore
      nftContract.connect(richWallet).mintNFT({
        value: ethers.parseEther("10.1"),
      })
    ).to.emit(nftContract, "NFTMinted");

    await new Promise((resolve) => setTimeout(resolve, 30000));

    await expect(
      nftContract.mintNFT({
        value: ethers.parseEther("100"),
      })
    ).to.be.revertedWithCustomError(nftContract, "ZKWillyNFT__MintEnded");
  });

  it("Should fail if random wallet tries to withdraw", async function () {
    const randomWallet = getRandomWallet();

    await expect(
      //@ts-ignore
      nftContract.connect(randomWallet).withdraw()
    ).to.be.reverted;
  });

  it("Should let owner withdraw", async function () {
    // Log the balance before
    console.log("Balance Before: ", await deployerWallet.getBalance());
    await expect(nftContract.withdraw()).to.emit(nftContract, "FundsWithdrawn");
    console.log("Balance After: ", await deployerWallet.getBalance());
  });

  it("Should add the eth to the owner's balance", async function () {
    const newBalance = await deployerWallet.getBalance();
    expect(newBalance).to.be.gt(balance);
  });
});
