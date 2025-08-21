import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDeposit } from "@/lib/deposit/getOrCreateDeposit";
import type { DepositRequestBody, ErrorResponse } from "@/types/api";

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

  try {
    const depositData = await getOrCreateDeposit(
      usdAmount,
      idempotencyKey,
      Number(session.user.id)
    );
    return NextResponse.json(depositData);
  } catch (error) {
    console.error("Deposit creation failed:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
