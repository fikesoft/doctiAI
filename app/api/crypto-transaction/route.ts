import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import { ErrorResponse, TransactionSerialized } from "@/types/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json<ErrorResponse>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const transactionsRaw = await prisma.cryptoTransaction.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      createdAt: true,
      status: true,
      cryptoAmount: true,
      fiatAmount: true,
    },
  });

  // Serialize Decimal fields to strings
  const transactionsSerialized: TransactionSerialized[] = transactionsRaw.map(
    (tx) => ({
      id: tx.id,
      createdAt: tx.createdAt,
      status: tx.status,
      cryptoAmount: tx.cryptoAmount.toString(),
      fiatAmount: tx.fiatAmount.toString(),
    })
  );

  return NextResponse.json({ transactions: transactionsSerialized });
}
