import { NextRequest, NextResponse } from "next/server";
import GPT3Tokenizer from "gpt-tokenizer";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const tokens = GPT3Tokenizer.encode(text).length; // directly gives number[]

    return NextResponse.json({ tokens });
  } catch (e) {
    return NextResponse.json({ tokens: 0, error: String(e) }, { status: 400 });
  }
}
