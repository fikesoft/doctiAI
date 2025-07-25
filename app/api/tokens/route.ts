import { NextRequest, NextResponse } from "next/server";
import { encoding_for_model, type TiktokenModel } from "@dqbd/tiktoken";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { setWasm } from "@dqbd/tiktoken/wasm";
import fs from "fs";
import path from "path";

let wasmLoaded = false;

export async function POST(req: NextRequest) {
  const { text, model } = await req.json();

  if (!wasmLoaded) {
    const wasmPath = path.resolve(process.cwd(), "public/tiktoken_bg.wasm");
    const wasm = fs.readFileSync(wasmPath);
    await setWasm(wasm);
    wasmLoaded = true;
  }

  try {
    const enc = encoding_for_model(model as TiktokenModel);
    const tokens = enc.encode(text).length;
    enc.free();
    return NextResponse.json({ tokens });
  } catch (e) {
    return NextResponse.json({ tokens: 0, error: String(e) }, { status: 400 });
  }
}
