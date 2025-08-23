import { prisma } from "@/lib/prisma";
import { convertUsdToSol } from "@/lib/solana/convertUsdToSol";
import { checkTransaction } from "@/lib/transaction/checkTransaction";
import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const usd = searchParams.get("usd");
    if (!usd || isNaN(Number(usd))) {
      return NextResponse.json(
        { valid: false, reason: "Invalid fiat amount" },
        { status: 400 }
      );
    }
    const expectedSol = convertUsdToSol(parseFloat(usd));

    if (!reference || !expectedSol) {
      return NextResponse.json(
        { valid: false, reason: "Missing parameters" },
        { status: 400 }
      );
    }

    // Call the checkTransaction helper
    const result = await checkTransaction(
      new PublicKey(reference),
      Number(expectedSol)
    );

    if (result.status === "confirmed") {
      await prisma.cryptoTransaction.update({
        where: { reference },
        data: {
          status: "confirmed",
          txSignature: result.signature,
          confirmedAt: new Date(),
        },
      });
    } else if (result.status === "failed") {
      await prisma.cryptoTransaction.update({
        where: { reference },
        data: { status: "failed" },
      });
    } else if (result.status === "pending") {
      await prisma.cryptoTransaction.update({
        where: { reference },
        data: { status: "pending" },
      });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    return NextResponse.json(
      { valid: false, reason: message },
      { status: 500 }
    );
  }
}
