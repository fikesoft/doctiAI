import { Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/nextauth";
import { convertUsdToSol } from "@/lib/solana/convertUsdToSol";
import { createUserWallet } from "@/lib/solana/createUserWallet";
import type { DepositRequestBody, ErrorResponse } from "@/types/api";
import buildDepositResponse from "@/lib/crypto/buildDepositResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json<ErrorResponse>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const idempotencyKey = req.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    return NextResponse.json<ErrorResponse>(
      { error: "Missing Idempotency-Key" },
      { status: 400 }
    );
  }

  let usdAmount: number | null = null;
  try {
    const body = (await req.json()) as DepositRequestBody;
    if (body?.usd != null) usdAmount = Number(body.usd);
  } catch {
    const q = req.nextUrl.searchParams.get("usd");
    if (q != null) usdAmount = Number(q);
  }

  if (usdAmount === null || Number.isNaN(usdAmount) || usdAmount <= 0) {
    return NextResponse.json<ErrorResponse>(
      { error: "Invalid usd" },
      { status: 400 }
    );
  }

  const userId = Number(session.user.id);

  // --- Existing transaction check ---
  const existing = await prisma.cryptoTransaction.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
  });

  if (existing) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: existing.walletId },
    });
    if (!wallet) {
      return NextResponse.json<ErrorResponse>(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }
    return buildDepositResponse(existing, wallet.walletAddress);
  }

  // --- Create new transaction ---
  const userWallet = await createUserWallet(userId);
  const quote = await convertUsdToSol(usdAmount);
  const reference = Keypair.generate().publicKey;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  let tx;
  try {
    tx = await prisma.cryptoTransaction.create({
      data: {
        userId,
        walletId: userWallet.walletId,
        idempotencyKey,
        currency: quote.idCurrency,
        cryptoAmount: quote.solana,
        fiatAmount: quote.usdAmount,
        exchangeRate: quote.solanaRate,
        status: "pending",
        reference: reference.toBase58(),
        expiresAt,
      },
    });
  } catch (e) {
    const deduped = await prisma.cryptoTransaction.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey } },
    });
    if (deduped) {
      return buildDepositResponse(deduped, userWallet.walletAddress);
    }
    throw e;
  }
  return buildDepositResponse(tx, userWallet.walletAddress);
}
