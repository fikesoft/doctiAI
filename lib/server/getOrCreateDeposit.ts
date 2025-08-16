import { prisma } from "@/lib/prisma";
import { convertUsdToSol } from "@/lib/solana/convertUsdToSol";
import { createUserWallet } from "@/lib/solana/createUserWallet";
import { encodeURL } from "@solana/pay";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
export type DepositData = {
  recipient: string;
  sol: string;
  solanaPayUrl: string;
};

export interface SolanaMakeUrlProps {
  walletAddress: string; // adresa portofelului
  cryptoAmount: string | number; // valoarea în SOL
  reference: string; // referință unică
  label?: string;
  message?: string;
  memo?: string;
}

export function makeSolanaPayUrl({
  walletAddress,
  cryptoAmount,
  reference,
  label,
  message,
  memo,
}: SolanaMakeUrlProps): string {
  const recipient = new PublicKey(walletAddress);
  const amount = new BigNumber(cryptoAmount);
  const referencePubkey = new PublicKey(reference);

  const url = encodeURL({
    recipient,
    amount,
    reference: referencePubkey,
    label,
    message,
    memo,
  });

  return url.toString();
}

export async function getOrCreateDeposit(
  usd: number,
  idempotencyKey: string,
  userId: number
): Promise<DepositData> {
  // 1. verificare după idempotencyKey
  const existingByIdempotency = await prisma.cryptoTransaction.findUnique({
    where: {
      userId_idempotencyKey: {
        userId,
        idempotencyKey,
      },
    },
  });

  if (existingByIdempotency) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: existingByIdempotency.walletId },
    });
    if (!wallet) throw new Error("Wallet not found");

    return {
      recipient: wallet.walletAddress,
      sol: existingByIdempotency.cryptoAmount.toFixed(6),
      solanaPayUrl: makeSolanaPayUrl({
        walletAddress: wallet.walletAddress,
        cryptoAmount: existingByIdempotency.cryptoAmount.toString(),
        reference: existingByIdempotency.reference,
        label: "Your App Name",
        message: `Deposit for $${usd.toFixed(2)}`,
      }),
    };
  }

  // 2. verificare după tranzacție pending cu aceeași sumă
  const existingByAmount = await prisma.cryptoTransaction.findFirst({
    where: {
      userId,
      fiatAmount: usd,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingByAmount) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: existingByAmount.walletId },
    });
    if (!wallet) throw new Error("Wallet not found");

    return {
      recipient: wallet.walletAddress,
      sol: existingByAmount.cryptoAmount.toFixed(6),
      solanaPayUrl: makeSolanaPayUrl({
        walletAddress: wallet.walletAddress,
        cryptoAmount: existingByAmount.cryptoAmount.toString(),
        reference: existingByAmount.reference,
        label: "Your App Name",
        message: `Deposit for $${usd.toFixed(2)}`,
      }),
    };
  }

  // 3. creare tranzacție nouă
  const userWallet = await createUserWallet(userId);
  const quote = await convertUsdToSol(usd);
  const reference = Keypair.generate().publicKey;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) throw new Error("User not found");

  try {
    const tx = await prisma.cryptoTransaction.create({
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

    return {
      recipient: userWallet.walletAddress,
      sol: tx.cryptoAmount.toFixed(6),
      solanaPayUrl: makeSolanaPayUrl({
        walletAddress: userWallet.walletAddress,
        cryptoAmount: tx.cryptoAmount.toString(),
        reference: tx.reference,
        label: "Your App Name",
        message: `Deposit for $${usd.toFixed(2)}`,
      }),
    };
  } catch (e) {
    const deduped = await prisma.cryptoTransaction.findUnique({
      where: {
        userId_idempotencyKey: {
          userId,
          idempotencyKey,
        },
      },
    });

    if (deduped) {
      return {
        recipient: userWallet.walletAddress,
        sol: deduped.cryptoAmount.toFixed(6),
        solanaPayUrl: makeSolanaPayUrl({
          walletAddress: userWallet.walletAddress,
          cryptoAmount: deduped.cryptoAmount.toString(),
          reference: deduped.reference,
          label: "Your App Name",
          message: `Deposit for $${usd.toFixed(2)}`,
        }),
      };
    }

    throw e;
  }
}
