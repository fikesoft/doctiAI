import { DepositResponse } from "@/types/api";
import { Decimal } from "@prisma/client/runtime/library";
import { encodeURL } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

export default function buildDepositResponse(
  tx: { id: number; cryptoAmount: Decimal; reference: string; expiresAt: Date },
  walletAddress: string
) {
  const recipient = new PublicKey(walletAddress);
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
