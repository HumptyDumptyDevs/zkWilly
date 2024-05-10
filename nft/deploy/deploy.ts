import * as hre from "hardhat";
import { initWhaleURIs, getChainlinkPriceFeedAddress } from "./helperConfig";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

// This script is used to deploy an NFT contract
// as well as verify it on Block Explorer if possible for the network
export default async function (
  mintDuration: number = 600,
  maxTokens: number = 10,
  minimumUSD = hre.ethers.parseUnits("1.0", "ether").toString()
) {
  const network = hre.network.name;
  const priceFeedAddress = await getChainlinkPriceFeedAddress(network);

  if (priceFeedAddress === "Address not available") {
    throw new Error(
      `No Chainlink Price Feed address configured for ${network}`
    );
  }

  console.log("Deploying ZKWillyNFT contract... on network: ", network);

  let wallet;

  if (
    network === "hardhat" ||
    network === "inMemoryNode" ||
    network === "dockerizedNode"
  ) {
    wallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
  } else {
    //48 hours in seconds
    mintDuration = 60 * 60 * 48;

    // $20
    minimumUSD = hre.ethers.parseUnits("20.0", "ether").toString();

    // Max 2500 tokens
    maxTokens = 2500;
    wallet = getWallet();
  }

  console.log(
    "Deploying ZKWillyNFT contract... with priceFeed: ",
    priceFeedAddress
  );

  const contract = await deployContract(
    "ZKWillyNFT",
    [initWhaleURIs, priceFeedAddress, maxTokens, mintDuration, minimumUSD],
    {
      wallet: wallet,
    }
  );

  return { contract, wallet };
}
