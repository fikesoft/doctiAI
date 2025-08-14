import { prisma } from "@/lib/prisma";
import { convertUsdToSol } from "@/lib/solana/convertUsdToSol";
import { createUserWallet } from "@/lib/solana/createUserWallet";
import { Keypair } from "@solana/web3.js";

export type DepositData = {
  recipient: string;
  sol: string;
  solanaPayUrl: string;
};

export async function getOrCreateDeposit(
  usd: number,
  idempotencyKey: string,
  userId: number
): Promise<DepositData> {
  // First check for existing transaction with this idempotency key
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

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return {
      recipient: wallet.walletAddress,
      sol: existingByIdempotency.cryptoAmount.toFixed(6),
      solanaPayUrl: `solana:${
        wallet.walletAddress
      }?amount=${existingByIdempotency.cryptoAmount.toFixed(6)}&reference=${
        existingByIdempotency.reference
      }`,
    };
  }

  // If no transaction with this idempotency key, check for pending transactions with same USD amount
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

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return {
      recipient: wallet.walletAddress,
      sol: existingByAmount.cryptoAmount.toFixed(6),
      solanaPayUrl: `solana:${
        wallet.walletAddress
      }?amount=${existingByAmount.cryptoAmount.toFixed(6)}&reference=${
        existingByAmount.reference
      }`,
    };
  }

  // Create new transaction (only if no existing pending transaction found)
  const userWallet = await createUserWallet(userId);
  const quote = await convertUsdToSol(usd);
  const reference = Keypair.generate().publicKey;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // Verify user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    throw new Error("User not found");
  }

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
      solanaPayUrl: `solana:${
        userWallet.walletAddress
      }?amount=${tx.cryptoAmount.toFixed(6)}&reference=${tx.reference}`,
    };
  } catch (e) {
    // Handle race conditions
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
        solanaPayUrl: `solana:${
          userWallet.walletAddress
        }?amount=${deduped.cryptoAmount.toFixed(6)}&reference=${
          deduped.reference
        }`,
      };
    }

    throw e;
  }
}
