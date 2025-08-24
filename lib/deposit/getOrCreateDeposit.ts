import { prisma } from "@/lib/prisma";
import { convertUsdToSol } from "@/lib/solana/convertUsdToSol";
import { encodeURL } from "@solana/pay";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
export type DepositData = {
  recipient: string | undefined;
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
  label = "DoctiAI",
  message,
  memo,
}: SolanaMakeUrlProps): string {
  const recipient = new PublicKey(walletAddress);
  const amount = new BigNumber(cryptoAmount).decimalPlaces(
    6,
    BigNumber.ROUND_DOWN
  );
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

const wallet =
  process.env.APP_STATE === "development"
    ? process.env.STATIC_WALLET_ADDRESS_DEV
    : process.env.STATIC_WALLET_ADDRESS_PROD;

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

  if (existingByIdempotency?.walletAddress) {
    return {
      recipient: existingByIdempotency.walletAddress,
      sol: existingByIdempotency.cryptoAmount.toFixed(6),
      solanaPayUrl: makeSolanaPayUrl({
        walletAddress: existingByIdempotency.walletAddress,
        cryptoAmount: existingByIdempotency.cryptoAmount.toString(),
        reference: existingByIdempotency.reference,
        label: "DoctiAI",
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

  if (existingByAmount?.walletAddress && existingByAmount) {
    return {
      recipient: existingByAmount.walletAddress,
      sol: existingByAmount.cryptoAmount.toFixed(6),
      solanaPayUrl: makeSolanaPayUrl({
        walletAddress: existingByAmount.walletAddress,
        cryptoAmount: existingByAmount.cryptoAmount.toString(),
        reference: existingByAmount.reference,
        label: "DoctiAI",
        message: `Deposit for $${usd.toFixed(2)}`,
      }),
    };
  }

  // 3. creare tranzacție nouă
  const userWallet = wallet;
  if (!userWallet) throw new Error("Wallet is not set");

  const quote = await convertUsdToSol(usd);
  const reference = Keypair.generate().publicKey;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) throw new Error("User not found");
  try {
    const tx = await prisma.cryptoTransaction.create({
      data: {
        userId,
        walletAddress: wallet,
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
      recipient: userWallet,
      sol: tx.cryptoAmount.toFixed(6),
      solanaPayUrl: makeSolanaPayUrl({
        walletAddress: userWallet,
        cryptoAmount: tx.cryptoAmount.toString(),
        reference: tx.reference,
        label: "DoctiAI",
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
        recipient: userWallet,
        sol: deduped.cryptoAmount.toFixed(6),
        solanaPayUrl: makeSolanaPayUrl({
          walletAddress: userWallet,
          cryptoAmount: deduped.cryptoAmount.toString(),
          reference: deduped.reference,
          label: "DoctiAI",
          message: `Deposit for $${usd.toFixed(2)}`,
        }),
      };
    }

    throw e;
  }
}
