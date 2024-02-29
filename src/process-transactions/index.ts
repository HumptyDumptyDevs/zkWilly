import { S3Event } from "aws-lambda";
import AWS from "aws-sdk";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config(); // Load environment variables

const s3 = new AWS.S3();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL! ?? "";
const supabaseKey = process.env.SUPABASE_API_KEY! ?? "";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

const valueThresholds = [
  { threshold: BigInt("10000000000000000000000"), classification: 7 }, // 10000 ETH
  { threshold: BigInt("1000000000000000000000"), classification: 6 }, // 1000 ETH
  { threshold: BigInt("250000000000000000000"), classification: 5 }, // 250 ETH
  { threshold: BigInt("100000000000000000000"), classification: 4 }, // 100 ETH
  { threshold: BigInt("50000000000000000000"), classification: 3 }, // 50 ETH
  { threshold: BigInt("25000000000000000000"), classification: 2 }, // 25 ETH
  { threshold: BigInt("10000000000000000000"), classification: 1 }, // 10 ETH
];

export const handler = async (event: S3Event) => {
  try {
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      const { Body } = await s3
        .getObject({ Bucket: bucketName, Key: key })
        .promise();

      const transactions: any[] = JSON.parse(Body!.toString("utf-8"));
      console.log(`Handling transactions from: ${key}`);
      console.log(`transactions: ${JSON.stringify(transactions)}`);

      // Upsert addresses
      if (transactions.length != 0) {
        for (const tx of transactions) {
          await upsertAddresses(tx);
        }
      }

      // Filter txns
      const filteredTransactions = filterTransactions(
        transactions,
        valueThresholds
      );

      //
      if (filteredTransactions.length > 0) {
        // Fetch Ethereum price before inserting
        const currentEthPrice = await fetchEthereumPrice();

        for (const tx of filteredTransactions) {
          await insertTransaction(tx, currentEthPrice);
        }

        console.log(`Filtered transactions written to Supabase`);
      } else {
        console.log("No transactions above threshold in", key);
      }
    }

    return {
      statusCode: 200,
      body: "Transactions processed successfully.",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};

async function upsertAddresses(tx: any) {
  // 1. Process Addresses (to and from)
  const addressesToUpdate = [tx.to, tx.from].filter((addr) => addr !== null);

  for (const address of addressesToUpdate) {
    try {
      // 2. Attempt to insert a new address
      console.log(`Attempting insert for address: ${address}...`);
      const { error: insertError } = await supabaseClient
        .from("addresses")
        .insert({
          address,
          txnCount: 1, // Initialize transaction count
        });

      // 3. If the insert fails with a unique constraint error, update the existing record
      if (insertError && insertError.code === "23505") {
        try {
          const { data, error: selectError } = await supabaseClient
            .from("addresses")
            .select("txnCount")
            .eq("address", address);

          if (selectError) {
            throw selectError;
          }

          if (data && data.length > 0) {
            const currentTxnCount = data[0].txnCount;

            // Perform the update
            console.log(
              `Address: ${address} already exists, updating txnCount to ${
                currentTxnCount + 1
              }...`
            );
            const { error: updateError } = await supabaseClient
              .from("addresses")
              .update({
                txnCount: currentTxnCount + 1,
                updated_at: new Date().toISOString(),
              })
              .eq("address", address);

            if (updateError) {
              throw updateError;
            }
          } else {
            console.error(`Address ${address} not found during update`);
          }
        } catch (error) {
          console.error(
            `Error processing address ${address} (update phase):`,
            error
          );
        }
      } else if (insertError) {
        throw insertError; // Handle other potential insert errors
      }
    } catch (error) {
      // Handle errors appropriately for each address
      console.error(`Error processing address ${address}:`, error);
    }
  }
}

async function fetchEthereumPrice() {
  /* We have a separate function to fetch the Ethereum price on
   * an interval so we don't hit the CoinGecko API on every
   * transaction processing event. */
  try {
    const { data, error } = await supabaseClient
      .from("prices")
      .select("priceUsd")
      .eq("symbol", "ETH")
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      return data.priceUsd;
    } else {
      throw new Error("Ethereum price not found in prices table");
    }
  } catch (error) {
    console.error("Error fetching Ethereum price:", error);
    throw error;
  }
}

function filterTransactions(transactions: any[], thresholds: any[]) {
  return transactions.filter((tx) => {
    const valueDecimal = BigInt(tx.value).toString(); // Assuming 'value' is hex
    console.log(`valueDecimal: ${valueDecimal}`);

    // Find the matching threshold
    const matchingThreshold = thresholds.find(
      (t) => BigInt(valueDecimal) > t.threshold
    );

    // Add classification if a threshold was matched
    if (matchingThreshold) {
      tx.classification = matchingThreshold.classification;
    }

    console.log(
      `matchingThreshold classification: ${JSON.stringify(
        matchingThreshold?.classification
      )} for tx: ${JSON.stringify(tx.hash)}`
    );

    return matchingThreshold;
  });
}

async function insertTransaction(tx: any, ethPriceUsd: number) {
  const valueDecimal = BigInt(tx.value).toString();
  const valueEth = parseFloat(valueDecimal) / 10 ** 18; // Assuming 18 decimals for ETH
  const valueUsd = valueEth * ethPriceUsd;

  if (tx.classification > 1) {
    // Upsert whale addresses
    console.log(`Updating whale addresses for tx: ${tx.hash}`);
    try {
      const { data, error } = supabaseClient.from("addresses").upsert([
        { address: tx.to, is_whale: true },
        { address: tx.from, is_whale: true },
      ]);
    } catch (error) {
      console.error(`Error upserting whale addresses: ${error}`);
    }
  }

  const { data, error } = await supabaseClient.from("whale_alert").insert({
    txnHash: tx.hash,
    blockNumber: tx.blockNumber,
    valueEth,
    valueUsd,
    toAddress: tx.to,
    fromAddress: tx.from,
    maxFeePerGas: tx.maxFeePerGas, // Can look to include gas price in future alerting too
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    classification: tx.classification,
  });

  if (error) {
    throw error;
  }
}
