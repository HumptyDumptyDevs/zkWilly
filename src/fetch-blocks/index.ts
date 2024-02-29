import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";
import * as dotenv from "dotenv";
import AWS from "aws-sdk";

dotenv.config();

const s3 = new AWS.S3();

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    const latestBlockNumber = await getLatestBlockNumber();

    // Check for errors from getLatestBlockNumber
    if (latestBlockNumber instanceof Error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: latestBlockNumber.message }),
      };
    }

    const lastProcessedBlockNumber = await getLastProcessedBlockNumber();

    // Only proceed if there are new blocks
    if (latestBlockNumber > lastProcessedBlockNumber) {
      const blocks = await getBlocksInRange(
        lastProcessedBlockNumber,
        latestBlockNumber
      );

      await storeBlocksAndLastProcessed(blocks, latestBlockNumber);

      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 200,
          blocks: blocks,
          latestBlockNumber: latestBlockNumber,
          lastProcessedBlockNumber: lastProcessedBlockNumber,
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "No new blocks to process",
        }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};

async function getLatestBlockNumber() {
  try {
    console.log("Fetching latest block number");
    const response = await axios.post(process.env.RPC_URL!, {
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 1,
    });

    if (response.status === 200 && response.data.result) {
      return response.data.result;
    } else {
      throw new Error(`RPC request to ${process.env.RPC_URL} failed`);
    }
  } catch (error) {
    console.error("Error fetching latest block number: ", error);
    return error as Error;
  }
}

async function getBlocksInRange(startBlock: string, endBlock: string) {
  console.log(`Fetching blocks from ${startBlock} to ${endBlock}`);
  const startBlockDecimal: number = parseInt(startBlock, 16);
  const endBlockDecimal: number = parseInt(endBlock, 16);

  const blockHexNumbers: string[] = [];
  for (
    let currentBlockNumber: number = startBlockDecimal + 1;
    currentBlockNumber <= endBlockDecimal;
    currentBlockNumber++
  ) {
    const blockHex: string = currentBlockNumber.toString(16);
    blockHexNumbers.push("0x" + blockHex); // Ensure '0x' prefix
  }

  return blockHexNumbers;
}

async function getLastProcessedBlockNumber() {
  console.log("Fetching last processed block number");
  const params = {
    Bucket: process.env.BUCKET_NAME!,
    Key: "block_data.json",
  };

  try {
    const { Body } = await s3.getObject(params).promise();
    const data = JSON.parse(Body!.toString("utf-8"));
    console.log("Last run time was: ", data.runDate);
    return data.lastProcessedBlock;
  } catch (err) {
    console.log("Error fecthing block_data.json: ", err);
    return 0;
  }
}

async function storeBlocksAndLastProcessed(
  blocks: string[],
  latestBlockNumber: string
) {
  console.log("Storing blocks and last processed block number");
  const runDate = new Date().toISOString(); // Capture the current timestamp

  const data = {
    blocks,
    lastProcessedBlock: latestBlockNumber,
    runDate,
  };

  const params = {
    Bucket: process.env.BUCKET_NAME!,
    Key: "block_data.json",
    Body: JSON.stringify(data),
  };

  console.log("Storing block data in S3");
  await s3.putObject(params).promise();
}
