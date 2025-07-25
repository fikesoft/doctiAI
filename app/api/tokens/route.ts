import { NextRequest, NextResponse } from "next/server";
import { encoding_for_model, type TiktokenModel } from "tiktoken";

export async function POST(req: NextRequest) {
  const { text, model } = await req.json();

  try {
    const enc = encoding_for_model(model as TiktokenModel);
    const tokens = enc.encode(text).length;
    enc.free();
    return NextResponse.json({ tokens });
  } catch (e) {
    return NextResponse.json({ tokens: 0, error: String(e) }, { status: 400 });
  }
}
