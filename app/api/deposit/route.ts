import { PublicKey } from "@solana/web3.js";
//import { encodeURL } from "@solana/pay";
import { NextRequest, NextResponse } from "next/server";
import { convertUsdToSol } from "@/lib/solana/convertUsdToSol";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import BigNumber from "bignumber.js";
import { createUserWallet } from "@/lib/solana/createUserWallet";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const usdParam = req.nextUrl.searchParams.get("usd");
  if (!usdParam) {
    return NextResponse.json({ error: "Missing usd param" });
  }

  const usdAmount = parseFloat(usdParam);
  if (isNaN(usdAmount)) {
    return NextResponse.json({ error: "Invalid usd param" });
  }

  // 1. Get user id (assuming you store it on the session)
  const userId = session.user.id;

  // 2. Get or create user wallet address
  const userWalletAddress = await createUserWallet(userId);

  // 3. Prepare Solana payment
  const convertedData = await convertUsdToSol(usdAmount);
  const amount = new BigNumber(convertedData.solana);
  const convertedSoalanaRate = convertedData.solanaRate;
  const convertedCurrency = convertedData.idCurrency;
  const recipient = new PublicKey(userWalletAddress.wallletAdress);

  const cryptoTransaction = await prisma.cryptoTransaction.create({
    data: {
      userId: session.user.id,
      walletId: userWalletAddress.wallletId,
      currency: convertedCurrency,
      cryptoAmount: convertedData.solana,
      fiatAmount: convertedData.usdAmount,
      exchangeRate: convertedSoalanaRate,
      txSignature: null,
      memo: null,
      status: "pending",
    },
  });

  return NextResponse.json({
    recipient: recipient.toString(),
    sol: amount.toString(),
    wallet: userWalletAddress,
    cryptoTransactionId: cryptoTransaction.id,
  });
}
