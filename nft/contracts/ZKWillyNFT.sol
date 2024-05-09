//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

/*
 * @title zkWilly X Sea Shepherd Charity NFT Project
 * @author Charlie Mack & Jack Goodacre
 * @notice This contract is an ERC721 implementation for minting charity NFTs on zkSync Era L2.
 */
contract ZKWillyNFT is ERC721, Ownable {
    using PriceConverter for *;

    ///////////////
    //  Errors   //
    ///////////////
    error ZKWillyNFT__NotEnoughETHSent();
    error ZKWillyNFT__NotEnoughWhales();
    error ZKWillyNFT__MaxTokensMinted();
    error ZKWillyNFT__MintNotStarted();
    error ZKWillyNFT__MintEnded();
    error ZKWillyNFT__MintNotEnded();

    /////////////////////////
    //  State Variables   //
    ////////////////////////
    uint256 private constant MINIMUM_USD = 20e18;
    uint256 private constant MINT_DURATION = 10 minutes;
    uint256 private s_mintStartTime;
    uint256 private s_tokenCounter;
    uint256 private s_nonce;
    address private immutable i_withdrawalWallet;
    uint256 private immutable i_tokenLimit;
    AggregatorV3Interface private immutable i_priceFeed;

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

    ///////////////
    // Events   //
    //////////////
    event MintStarted(uint256 indexed startTime);
    event NFTMinted(address indexed minter, uint256 indexed tokenId);
    event FundsWithdrawn(uint256 indexed amount);

    /*
     * @notice Initializes the NFT contract.
     * @dev The length of `initWhaleURIs` must equal the number of whale types.
     * @param initWhaleURIs Array of image URIs for each whale type.
     * @param priceFeedAddress Address of the Chainlink ETH/USD price feed.
     * @param tokenLimit Maximum number of tokens allowed to be minted.
     * @param withdrawalWallet Address for receiving collected funds.
     */
    constructor(
        string[] memory _initWhaleURIs,
        address _priceFeedAddress,
        uint256 _tokenLimit,
        address _withdrawalWallet
    ) ERC721("zkWillyNFT", "WILLY") Ownable() {
        if (_initWhaleURIs.length != 21) {
            revert ZKWillyNFT__NotEnoughWhales();
        }
        for (uint256 i = 0; i < _initWhaleURIs.length; i++) {
            s_whaleTypeToURI[WhaleType(i)] = _initWhaleURIs[i];
        }
        i_tokenLimit = _tokenLimit;
        i_priceFeed = AggregatorV3Interface(_priceFeedAddress);
        i_withdrawalWallet = _withdrawalWallet;
        s_nonce = 0;
        s_tokenCounter = 1;
    }

    /*
     * @notice Starts the minting process.
     * @dev The minting process is only available to the contract owner.
     */
    function startMint() public onlyOwner {
        s_mintStartTime = block.timestamp;
        emit MintStarted(s_mintStartTime);
    }

    /*
     * @notice Mints an NFT for the sender.
     * @dev The minting process is only available during the minting period.
     * @dev The minting process is only available if the maximum number of tokens has not been minted.
     * @dev The minting process is only available if the sender has sent enough ETH.
     */
    function mintNFT() public payable {
        if (s_mintStartTime == 0) {
            revert ZKWillyNFT__MintNotStarted();
        }

        if (block.timestamp > s_mintStartTime + MINT_DURATION) {
            revert ZKWillyNFT__MintEnded();
        }

        if (s_tokenCounter > i_tokenLimit) {
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

        emit NFTMinted(msg.sender, tokenId);
    }

    /*
     * @notice Withdraws the contract's balance to the designated wallet.
     * @notice Unfortunately we were unable to withdraw directly to The Giving Block's wallet
     * as they are unable to receive funds on zkSync.
     * @notice Their systems are also not set up to claim a bridge withdrawal on L1.
     * @notice The funds will be sent to the designated wallet and then manually sent to The Giving Block.
     * @notice We will provide full transparency & receipts on the funds sent to The Giving Block.
     */
    function withdraw() public onlyOwner {
        // Ensure minting has ended
        if (block.timestamp < s_mintStartTime + MINT_DURATION) {
            revert ZKWillyNFT__MintNotEnded();
        }

        // Get the current contract balance
        uint256 currentBalance = address(this).balance;
        (bool success, ) = i_withdrawalWallet.call{value: currentBalance}(""); // Send Ether
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(currentBalance);
    }

    /*
     * @notice Generates a psuedo-random number.
     * @param modulus The modulus to use for the random number.
     */
    function getPsuedoRandomNumber(uint8 modulus) private returns (uint8) {
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, s_nonce))
        );
        s_nonce++;
        return uint8(random % modulus);
    }

    /*
     * @notice Determines the whale type based on the minter's balance.
     * @param chance The random number generated to determine the whale type.
     * @param balance The balance of the minter.
     */
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

    /*
     * @notice Returns the whale type.
     */
    function getWhaleType(uint256 _tokenId) public view returns (WhaleType) {
        return s_tokenIdToWhale[_tokenId];
    }

    /*
     * @notice Returns the total number of tokens minted so far.
     * @notice -1 as s_tokenCounter begins at 1.
     */
    function getTotalTokenCount() public view returns (uint256) {
        return s_tokenCounter - 1;
    }

    /*
     * @notice Returns the maximum number of NFTs that can be minted.
     */
    function getTokenLimit() public view returns (uint256) {
        return i_tokenLimit;
    }

    /*
     * @notice Returns the minimum USD value required for minting.
     */
    function minimumUSD() public pure returns (uint256) {
        return MINIMUM_USD;
    }

    /*
     * @notice Returns the duration of the minting period.
     */
    function mintDuration() public pure returns (uint256) {
        return MINT_DURATION;
    }

    /*
     * @notice Returns the timestamp when the minting process started.
     */
    function mintStartTime() public view returns (uint256) {
        return s_mintStartTime;
    }

    /*
     * @notice Returns the address designated to receive collected funds.
     */
    function withdrawalWallet() public view returns (address) {
        return i_withdrawalWallet;
    }

    /*
     * @notice Returns the current price of ETH in USD.
     */
    function getEthPrice() public view returns (uint256) {
        return PriceConverter.getPriceInEth(i_priceFeed, MINIMUM_USD);
    }

    /*
     * @notice Returns the amount of time left in the current mint window.
     * @return remainingTime The time remaining in seconds, or 0 if the mint period has ended.
     */
    function getTimeLeftOnMint() public view returns (uint256) {
        // Ensure the mint has started
        if (s_mintStartTime == 0) {
            return 0;
        }

        // Calculate the end time of the mint
        uint256 mintEndTime = s_mintStartTime + MINT_DURATION;

        // Check if the mint has ended
        if (block.timestamp >= mintEndTime) {
            return 0;
        }

        // Return the remaining time
        uint256 remainingTime = mintEndTime - block.timestamp;
        return remainingTime;
    }

    /*
     * @notice Returns the URI for a given token ID.
     * @param tokenId The ID of the token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return s_whaleTypeToURI[s_tokenIdToWhale[tokenId]];
    }
}
