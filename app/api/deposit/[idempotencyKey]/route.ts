import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import { DepositResponse, ErrorResponse } from "@/types/api";
import { encodeURL } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json<ErrorResponse>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const idempotencyKey = req.nextUrl.pathname.split("/").pop();

  if (!idempotencyKey) {
    return NextResponse.json<ErrorResponse>(
      { error: "Missing Idempotency-Key" },
      { status: 400 }
    );
  }

  const userId = Number(session.user.id);

  const tx = await prisma.cryptoTransaction.findUnique({
    where: {
      userId_idempotencyKey: {
        userId,
        idempotencyKey: idempotencyKey,
      },
    },
  });
  if (!tx) {
    return NextResponse.json<ErrorResponse>(
      { error: "Transaction not found" },
      { status: 404 }
    );
  }

  if (tx.status === "confirmed" || tx.status === "failed") {
    return new NextResponse(null, { status: 204 });
  }

  const wallet = process.env.STATIC_WALLET_ADDRESS!;

  const recipient = new PublicKey(wallet);
  const url = encodeURL({
    recipient,
    amount: new BigNumber(tx.cryptoAmount.toString()),
    reference: new PublicKey(tx.reference),
    label: "DoctiAI Deposit",
    message: `Deposit #${tx.id}`,
  });

  return NextResponse.json<DepositResponse>({
    cryptoTransactionId: tx.id,
    recipient: recipient.toBase58(),
    sol: tx.cryptoAmount.toString(),
    reference: tx.reference,
    expiresAt: tx.expiresAt.toISOString(),
    solanaPayUrl: url.toString(),
  });
}
