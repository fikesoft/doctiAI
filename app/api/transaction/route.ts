import { makeAndSendTransaction } from "@/lib/transaction/makeAndSendTransaction";
import { NextResponse } from "next/server";

const recipient =
  process.env.APP_STATE === "development"
    ? process.env.STATIC_WALLET_ADDRESS_DEV
    : process.env.STATIC_WALLET_ADDRESS_PROD;

export async function POST(req: Request) {
  try {
    const { amountSol, reference } = await req.json();

    if (!recipient) {
      return NextResponse.json(
        { error: "Missing recipient wallet address" },
        { status: 500 }
      );
    }

    if (!amountSol || isNaN(Number(amountSol))) {
      return NextResponse.json(
        { error: "Missing or invalid amountSol" },
        { status: 400 }
      );
    }

    const result = await makeAndSendTransaction({
      amountSol: Number(amountSol),
      reference,
      recipient,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Transaction error:", err.message);
      return NextResponse.json(
        { error: "Failed to send transaction", details: err.message },
        { status: 500 }
      );
    }

    console.error("Transaction error:", err);
    return NextResponse.json(
      { error: "Failed to send transaction", details: String(err) },
      { status: 500 }
    );
  }
}
