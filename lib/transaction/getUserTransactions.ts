import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { TransactionSerialized } from "@/types/api";

export async function getUserTransactions(): Promise<TransactionSerialized[]> {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const transactionsRaw = await prisma.cryptoTransaction.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      createdAt: true,
      status: true,
      cryptoAmount: true,
      fiatAmount: true,
      idempotencyKey: true,
    },
  });

  return transactionsRaw.map((tx) => ({
    ...tx,
    cryptoAmount: tx.cryptoAmount.toString(),
    fiatAmount: tx.fiatAmount.toString(),
  }));
}
