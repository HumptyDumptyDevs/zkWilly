// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        return uint256(answer * 10000000000);
    }

    // 1000000000
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        // the actual ETH/USD conversion rate, after adjusting the extra 0s.
        return ethAmountInUsd;
    }

    function getPriceInEth(
        AggregatorV3Interface priceFeed,
        uint256 minimumUsd
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        // scalingFactor to adjust the decimal places ahead of division
        uint256 scalingFactor = 1e18;
        uint256 scaledMinimumUsd = minimumUsd * scalingFactor; // Assuming 18 decimals for ETH
        uint256 ethAmount = scaledMinimumUsd / ethPrice;
        return ethAmount;
    }
}
