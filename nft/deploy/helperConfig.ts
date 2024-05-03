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
  "ipfs://QmY4TJEBNdARPwfXBvL2HhKsQf36PjUGokz2wksd5oF5ah/", // Plankton
  "ipfs://QmWDScpviJzPzD8WhEday1GjVTMMiQF3UNtP5aDqPh6oxT/", // Shiny Plankton
  "ipfs://Qma5DPMj4XeihW6mvuGuqUbjkbLeSJUWsHqGkBX98Qnkeg/", // Shrimp
  "ipfs://QmcW2z6UfXQcV1n9zt9fQCiUPNqop8tvCGmuTtMMR84ZkF/", // Shiny Shrimp
  "ipfs://QmaBDxQgh9vRRqswacic6tAZgfjnu5Ci9uY2krzBZf4GVB/", // Pufferfish
  "ipfs://QmedpgVF91HHdWXN1yn9v5PMVPdoee6627ANaBVbmWRQTX/", // Shiny Pufferfish
  "ipfs://QmV1mtATyJ8s6Z6Z2uukVtDxa1vo9rduEz6aXY5D1UYgWh/", // Dolphin
  "ipfs://QmSPaNzEYQKd6t7a3idMsLf2tba7sdPJraRfPk2LZtKoRh/", // Shiny Dolphin
  "ipfs://Qmd1A3nS9BaSRhrFmSA7hoS86qaAZ1MTfEKVAMdQ9uwYwv/", // Beluga Whale
  "ipfs://QmXVbcKt2VCPkZmV2aKwBdPx6PBch9Uv7dRPmW8SC8qGjD/", // Shiny Beluga Whale
  "ipfs://QmXaMHiJUXBg4Kq1eozmashFdLS1kHkiFKgAdXz13dqSMC/", // Narwhal
  "ipfs://QmRyxrqQgLSAVXs4b2T3k5ubBgjT5NE8UF2sExWFimdxWA/", // Shiny Narwhal
  "ipfs://Qmf5mH5fSwe8Q72g2eagJaHBUHQxgsyyMFZqkDGCs3dcaZ/", // Orca
  "ipfs://QmViHFvfytZR95txpUf38G9YJV2BuX2ThH5UaGcdJMstgN/", // Shiny Orca
  "ipfs://QmTQFQVUFTNscWvptfC5m3ZHNZ4d8cc8WiRuYBbmXrUpCE/", // Humpback Whale
  "ipfs://QmNgxr5tYhpkUmVzvRnpzGuvYpFdBvMXNasC4MHAtZ2xfo/", // Shiny Humpback Whale
  "ipfs://QmQdGNx8ZCdegtvHzvFykZWmgYKNB6dH9Tqg3E39YtuBEz/", // Sperm Whale
  "ipfs://QmPRkvqRBmpZAcGoML8Secxng3CFwipQiP13Hj7iray7HP/", // Shiny Sperm Whale
  "ipfs://QmPA7KZAaSSxuaeAWjLpCpJZpiry16tZgEtEwy1UhBrXgX/", // Blue Whale
  "ipfs://QmdGKySFeWNpqgsij2vGiHiZU1qYbqevyjgrnmcydecNNe/", // Shiny Blue Whale
  "ipfs://QmaEGwr94jusX6snxrytrsiMCrjDZRtAAQUz8uE5Z9NiTz/", // Golden Willy
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
