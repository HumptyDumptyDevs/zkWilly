import { S3Event } from "aws-lambda";
import AWS from "aws-sdk";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3();

export const handler = async (event: S3Event) => {
  try {
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      const { Body } = await s3
        .getObject({ Bucket: bucketName, Key: key })
        .promise();
      const data = JSON.parse(Body!.toString("utf-8"));
      const blocks = data.blocks;

      await processBlocks(blocks);
    }

    return {
      statusCode: 200,
      body: "! fetch-transactions completed.",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};

async function processBlocks(blocks: string[]) {
  for (const blockNumber of blocks) {
    try {
      const blockData = await fetchBlockData(blockNumber);
      const transactions = blockData.transactions;
      await writeToS3(blockNumber, transactions);
    } catch (error) {
      console.error(`Error processing block ${blockNumber}:`, error);
    }
  }
}

async function fetchBlockData(blockNumber: string) {
  const response = await axios.post(process.env.RPC_URL!, {
    jsonrpc: "2.0",
    method: "eth_getBlockByNumber",
    params: [blockNumber, true],
    id: 1,
  });

  if (response.status === 200 && response.data.result) {
    return response.data.result;
  } else {
    throw new Error(`RPC request for block ${blockNumber} failed`);
  }
}

async function writeToS3(blockNumber: string, transactions: any[]) {
  const fileContent = JSON.stringify(transactions);
  const fileName = `${blockNumber}_txns.json`;

  await s3
    .putObject({
      Bucket: process.env.BUCKET_NAME!,
      Key: fileName,
      Body: fileContent,
    })
    .promise();

  console.log(`Transactions for block ${blockNumber} saved to S3`);
}
