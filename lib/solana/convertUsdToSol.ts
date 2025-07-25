import axios from "axios";

const API_KEY = process.env.COINGECKO_API_KEY; // Replace with your CoinGecko API key

/**
 * Converts a USD amount to SOL using CoinGecko API.
 * @param usdAmount - The amount in USD you want to convert.
 * @returns The amount of SOL (as number) for the given USD value.
 */
export async function convertUsdToSol(
  usdAmount: number
): Promise<{
  usdAmount: number;
  solana: number;
  solanaRate: number;
  idCurrency: string;
}> {
  const url = "https://api.coingecko.com/api/v3/simple/price";
  const params = {
    ids: "solana",
    vs_currencies: "usd",
  };
  const headers = {
    "x-cg-demo-api-key": API_KEY,
  };

  const res = await axios.get(url, { params, headers });
  const solPrice = res.data.solana.usd;

  if (!solPrice || typeof solPrice !== "number") {
    throw new Error("Could not retrieve SOL price.");
  }

  // Convert USD to SOL
  return {
    usdAmount: usdAmount,
    solana: usdAmount / solPrice,
    solanaRate: solPrice,
    idCurrency: "solana",
  };
}
