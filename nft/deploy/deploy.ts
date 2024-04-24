import * as hre from "hardhat";
import { initWhaleURIs, getChainlinkPriceFeedAddress } from "./helperConfig";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

// This script is used to deploy an NFT contract
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const network = hre.network.name;
  const priceFeedAddress = await getChainlinkPriceFeedAddress(network);

  if (priceFeedAddress === "Address not available") {
    throw new Error(
      `No Chainlink Price Feed address configured for ${network}`
    );
  }

  console.log("Deploying ZKWillyNFT contract... on network: ", network);

  //if network is local, deploy using local rich wallet
  const wallet =
    network === "hardhat" ||
    network === "localhost" ||
    network === "dockerizedNode"
      ? getWallet(LOCAL_RICH_WALLETS[0].privateKey)
      : getWallet();

  console.log(
    "Deploying ZKWillyNFT contract... with priceFeed: ",
    priceFeedAddress
  );

  const contract = await deployContract(
    "ZKWillyNFT",
    [initWhaleURIs, priceFeedAddress],
    {
      wallet,
    }
  );

  return { contract, wallet };
}