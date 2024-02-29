import { createClient } from "npm:@supabase/supabase-js@2";

// Create a Supabase client (replace with your credentials)
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

console.log("! Hit get-eth-price !");

Deno.serve(async () => {
  // Simulate CoinGecko API Key
  const apiKey = Deno.env.get("COINGECKO_API_KEY") ?? "";

  const url = `https://api.coingecko.com/api/v3/simple/price?x_cg_demo_api_key=${apiKey}`;

  const params = {
    ids: "ethereum",
    vs_currencies: "usd",
    include_market_cap: "true",
    include_24hr_vol: "true",
    include_24hr_change: "true",
  };

  try {
    // Construct query string
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}&${queryString}`;

    const response = await fetch(fullUrl);

    if (!response.ok) {
      return new Response("Error fetching price from CoinGecko", {
        status: response.status,
      });
    }

    const data = await response.json();
    const ethPriceUSD = data.ethereum.usd;

    console.log(`ETH price: $${ethPriceUSD}`);

    // Insert or Update record in Supabase's 'prices' table
    const { error } = await supabaseClient
      .from("prices")
      .upsert({
        symbol: "ETH",
        priceUsd: ethPriceUSD,
        updated_at: new Date().toISOString(), // Set to current timestamp
      })
      .single();

    if (error) {
      return new Response(`Error writing to Supabase: ${error.message}`, {
        status: 500,
      });
    }

    return new Response(`ETH price updated in Supabase!`, { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
