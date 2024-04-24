import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "./utils";

export async function getChainlinkPriceFeedAddress(network) {
  const feeds = {
    zkSyncSepoliaTestnet: "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF",
    zkSyncMainnet: "0x6D41d1dc818112880b40e26BD6FD347E41008eDA",
  };

  // Check if the network is a local or dockerized node
  if (
    network === "hardhat" ||
    network === "localhost" ||
    network === "dockerizedNode"
  ) {
    const wallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    // Deploy MockV3Aggregator if we're on a local test network
    const mockV3Aggregator = await deployContract(
      "MockV3Aggregator",
      [8, 4000e8],
      { wallet }
    );

    return mockV3Aggregator.target; // Return the deployed mock contract address
  }

  return feeds[network] || "Address Not Available";
}

export const initWhaleURIs = [
  "ipfs://bafybeifij3cp5qpu6lyzwipcwfizmku76677znncbpma4uswj62hw3x64a/", // Plankton
  "ipfs://bafybeidupvoizsugpjnv5i7cbk2rqqosx5xxximdgerh3sbqojm345wc3q/", // Shiny Plankton
  "ipfs://bafybeibezlp2riqhpvj3qphx6ylzcvm3si3logkh5zqwdbuy4qb2ytrtjq/", // Shrimp
  "ipfs://bafybeid2vmtql3kxzojofp6dmqzs3wuovbj4oo3gblprcgqmlqktljtxeq/", // Shiny Shrimp
  "ipfs://bafybeickhw2nqjly634oxvxmt6iiymq3sybkxj5x7uv4kxfzvujiu336vq/", // Pufferfish
  "ipfs://bafybeidv5jds4uphp3k556c4omjyimlcnbztovwkq2avrosd66c2fj7t7q/", // Shiny Pufferfish
  "ipfs://bafybeibttbf4kavxtlmmpnu5cfmzxlxhgj3b7otcjzrlhynmp4me27t75a/", // Dolphin
  "ipfs://bafybeib32vx4vsrlb4pz5ril4dqpix5vfv7atnadfrmqnlg5fiil6cj5te/", // Shiny Dolphin
  "ipfs://bafybeigha5hy5z2e7i2xgtttoc3xppj5zgfakjkwmvoovrm4rzywvegsaq/", // Beluga Whale
  "ipfs://bafybeiexrte6ljd7uuzcrzatxmhxokvr22hcauhp3fuaov2l3qbangml6q/", // Shiny Beluga Whale
  "ipfs://bafybeigc3w3l2ylfsqbuvf2hsplriaw6jzi3oz2mwhspxscxmutlltfexa/", // Narwhal
  "ipfs://bafybeidr4sd4alx6k2xsupx4injrpsm6m4qep35tii3mbflebumg5lo5o4/", // Shiny Narwhal
  "ipfs://bafybeic3m7o2qw4by7mstiwukevytbsu2fqqcxb5xmifw7cialijj5fpuq/", // Orca
  "ipfs://bafybeifcz3eooqvsxufezd3epcljc64ttgnyxr3vfydxswne6iyyy6bcny/", // Shiny Orca
  "ipfs://bafybeigt257qbdpilruze6wxemz6q5lyu65p2czje2fimk7xtqrh46sh7u/", // Humback Whale
  "ipfs://bafybeiaa4yb4szjvvq2ni2gbxwld5unvibwvtixnpiazoqclk5vxmusr6u/", // Shiny Humback Whale
  "ipfs://bafybeiavxwub6ojqcwqqq25xh6l7z32qykhahc5cl45m766e47azsbesge/", // Sperm Whale
  "ipfs://bafybeicousbxlyjge25iwzomjnhs5uurq2vb7qiqg7dqjohggtg2oblozm/", // Shiny Sperm Whale
  "ipfs://bafybeibix2lvq7m4tsv7wjebeezzqqyn4dcsxclnd2wu43r2nnmayq2qr4/", // Blue Whale
  "ipfs://bafybeihq5ba6wkpetsrpfcxyzuzm54lcjw7jkl4w2q5leqpz3ayccjdmby/", // Shiny Blue Whale
  "ipfs://bafybeifwqjlefotbds2cuakwredj4klxlsivkksqb4su6stysgqvekcdue/", // Golden Willy
];

export const whaleTypes = [
  "PLANKTON",
  "SHINY_PLANKTON",
  "SHRIMP",
  "SHINY_SHRIMP",
  "PUFFERFISH",
  "SHINY_PUFFERFISH",
  "DOLPHIN",
  "SHINY_DOLPHIN",
  "BELUGA_WHALE",
  "SHINY_BELUGA_WHALE",
  "NARWHAL",
  "SHINY_NARWHAL",
  "ORCA",
  "SHINY_ORCA",
  "HUMPBACK_WHALE",
  "SHINY_HUMPBACK_WHALE",
  "SPEM_WHALE",
  "SHINY_SPERM_WHALE",
  "BLUE_WHALE",
  "SHINY_BLUE_WHALE",
  "GOLDEN_WILLY",
];
