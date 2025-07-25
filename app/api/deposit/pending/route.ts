import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/nextauth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pending = await prisma.cryptoTransaction.findMany({
    where: {
      userId: session.user.id,
      status: "pending",
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 15), // only last 15min
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pending);
}
