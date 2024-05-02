//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {PriceConverter} from "./PriceConverter.sol";

contract ZKWillyNFT is ERC721, Ownable {
    using PriceConverter for *;

    error ZKWillyNFT__NotEnoughETHSent();
    error ZKWillyNFT__NotEnoughWhales();
    error ZKWillyNFT__MaxTokensMinted();

    event NFTMinted(address indexed minter, uint256 indexed tokenId);

    uint256 public constant MINIMUM_USD = 1e18;
    uint256 public constant MAX_TOKENS = 2500;

    uint256 private s_tokenCounter;
    uint256 private s_nonce;
    AggregatorV3Interface private s_priceFeed;

    // address payable public seaShepherdWallet;

    enum WhaleType {
        PLANKTON,
        SHINY_PLANKTON,
        SHRIMP,
        SHINY_SHRIMP,
        PUFFERFISH,
        SHINY_PUFFERFISH,
        DOLPHIN,
        SHINY_DOLPHIN,
        BELUGA_WHALE,
        SHINY_BELUGA_WHALE,
        NARWHAL,
        SHINY_NARWHAL,
        ORCA,
        SHINY_ORCA,
        HUMPBACK_WHALE,
        SHINY_HUMPBACK_WHALE,
        SPERM_WHALE,
        SHINY_SPERM_WHALE,
        BLUE_WHALE,
        SHINY_BLUE_WHALE,
        GOLDEN_WILLY
    }

    mapping(uint256 => WhaleType) private s_tokenIdToWhale;
    mapping(WhaleType => string) private s_whaleTypeToURI;

    constructor(
        string[] memory initWhaleURIs,
        address priceFeed
    )
        // address payable _seaShepherdWallet
        ERC721("zkWillyNFT", "WILLY")
        Ownable()
    {
        if (initWhaleURIs.length != 21) {
            revert ZKWillyNFT__NotEnoughWhales();
        }
        for (uint256 i = 0; i < initWhaleURIs.length; i++) {
            s_whaleTypeToURI[WhaleType(i)] = initWhaleURIs[i];
        }
        s_priceFeed = AggregatorV3Interface(priceFeed);
        s_nonce = 0;
        s_tokenCounter = 1;
        // seaShepherdWallet = _seaShepherdWallet;
    }

    function mintNFT() public payable {
        if (s_tokenCounter > MAX_TOKENS) {
            revert ZKWillyNFT__MaxTokensMinted();
        }

        if (msg.value < getEthPrice()) {
            revert ZKWillyNFT__NotEnoughETHSent();
        }

        uint256 tokenId = s_tokenCounter;

        uint8 chance = getPsuedoRandomNumber(100);
        WhaleType whaleType = determineWhaleType(chance, msg.sender.balance);
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenIdToWhale[s_tokenCounter] = whaleType;
        s_tokenCounter++;

        // (bool success, ) = seaShepherdWallet.call{value: msg.value}("");
        // require(success, "Failed to send ETH to designated address");

        emit NFTMinted(msg.sender, tokenId);
    }

    function getPsuedoRandomNumber(uint8 modulus) private returns (uint8) {
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, s_nonce))
        );
        s_nonce++;
        return uint8(random % modulus);
    }

    function determineWhaleType(
        uint8 chance,
        uint256 balance
    ) private pure returns (WhaleType) {
        if (chance == 1) {
            return WhaleType.GOLDEN_WILLY;
        }

        if (balance < 0.01 ether) {
            return chance < 10 ? WhaleType.SHINY_PLANKTON : WhaleType.PLANKTON;
        } else if (balance < 0.2 ether) {
            return chance < 10 ? WhaleType.SHINY_SHRIMP : WhaleType.SHRIMP;
        } else if (balance < 0.5 ether) {
            return
                chance < 10 ? WhaleType.SHINY_PUFFERFISH : WhaleType.PUFFERFISH;
        } else if (balance < 1 ether) {
            return chance < 10 ? WhaleType.SHINY_DOLPHIN : WhaleType.DOLPHIN;
        } else if (balance < 3 ether) {
            return
                chance < 10
                    ? WhaleType.SHINY_BELUGA_WHALE
                    : WhaleType.BELUGA_WHALE;
        } else if (balance < 5 ether) {
            return chance < 10 ? WhaleType.SHINY_NARWHAL : WhaleType.NARWHAL;
        } else if (balance < 10 ether) {
            return chance < 10 ? WhaleType.SHINY_ORCA : WhaleType.ORCA;
        } else if (balance < 20 ether) {
            return
                chance < 10
                    ? WhaleType.SHINY_HUMPBACK_WHALE
                    : WhaleType.HUMPBACK_WHALE;
        } else if (balance < 100 ether) {
            return
                chance < 10
                    ? WhaleType.SHINY_SPERM_WHALE
                    : WhaleType.SPERM_WHALE;
        } else {
            return
                chance < 10 ? WhaleType.SHINY_BLUE_WHALE : WhaleType.BLUE_WHALE;
        }
    }

    function getWhaleType(uint256 _tokenId) public view returns (WhaleType) {
        return s_tokenIdToWhale[_tokenId];
    }

    function getTotalTokenCount() public view returns (uint256) {
        return s_tokenCounter - 1;
    }

    function getEthPrice() public view returns (uint256) {
        return PriceConverter.getPriceInEth(s_priceFeed, MINIMUM_USD);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return s_whaleTypeToURI[s_tokenIdToWhale[tokenId]];
    }
}
