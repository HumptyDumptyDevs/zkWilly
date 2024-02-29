import { oauth1a } from "https://deno.land/x/twitter_api_fetch@v2.2.1/mod.ts";

const fetcher = await oauth1a({
  consumerKey: Deno.env.get("TWITTER_CONSUMER_ACCESS_TOKEN"),
  secretConsumerKey: Deno.env.get("TWITTER_CONSUMER_SECRET_TOKEN"),
  accessToken: Deno.env.get("TWITTER_ACCESS_TOKEN"),
  secretAccessToken: Deno.env.get("TWITTER_SECRET_TOKEN"),
});

Deno.serve(async (req: Request) => {
  // Handle webhook payload
  if (req.method === "POST") {
    let tweetText = "";

    const payload: InsertPayload = await req.json();

    if (payload.type === "INSERT" && payload.table === "public.whale_alert") {
      const record = payload.record;
      const usdFormatted = record.valueUsd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });

      switch (record.classification) {
        case 5:
          tweetText = `🚨🐋 zkSync Orca Whale Spotted! 🐋🚨\n\n${record.valueEth} ETH (${usdFormatted}) transferred from ${record.fromAddress} to ${record.toAddress}\nhttps://explorer.zksync.io/tx/${record.txnHash}\n\n#zksync #eth #zkwilly #whalealert`;
          break;
        case 6:
          tweetText = `🚨🚨🐋 zkSync Humpback Whale Spotted! 🐋🚨🚨\n\n${record.valueEth} ETH (${usdFormatted}) transferred from ${record.fromAddress} to ${record.toAddress}\nhttps://explorer.zksync.io/tx/${record.txnHash}\n\n#zksync #eth #zkwilly #whalealert`;
          break;
        case 7:
          tweetText = `🚨🚨🚨🐋 zkSync Blue Whale Spotted! 🐋🚨🚨🚨\n\n${record.valueEth} ETH (${usdFormatted}) transferred from ${record.fromAddress} to ${record.toAddress}\nhttps://explorer.zksync.io/tx/${record.txnHash}\n\n#zksync #eth #zkwilly #whalealert`;
          break;
        default:
          return new Response(
            `Alert classification (${record.classification}) under minimum threshold!`,
            { status: 200 }
          );
      }
    }

    // Post the tweet
    try {
      const response = await fetcher("/2/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweetText }),
      });

      return new Response(`Alert posted for ${record.txnHash}!`, {
        status: 200,
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
});
