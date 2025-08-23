import {
  Connection,
  ParsedInstruction,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";
import { prisma } from "../prisma";

const connection = new Connection(process.env.QUICKNODE_DEV!, "confirmed");

const SCAN_LIMIT = 500;

export async function checkTransaction(
  reference: PublicKey,
  expectedSol: number
): Promise<{
  valid: boolean;
  reason?: string;
  signature?: string;
  status: "confirmed" | "pending" | "failed";
  timeLeftMs?: number;
}> {
  const refStr = reference.toString();
  console.log(">>> Checking transaction for reference:", refStr);

  const dataTransaction = await prisma.cryptoTransaction.findUnique({
    where: { reference: refStr },
    select: { walletAddress: true, createdAt: true, expiresAt: true },
  });
  console.log("DB result:", dataTransaction);

  if (!dataTransaction)
    return { valid: false, reason: "db_not_found", status: "failed" };

  const { walletAddress, expiresAt } = dataTransaction;
  if (!walletAddress)
    return { valid: false, reason: "recipient_missing", status: "failed" };

  const now = new Date();
  const graceUntil = new Date(new Date(expiresAt).getTime() + 5 * 60 * 1000);
  const timeLeftMs = Math.max(0, graceUntil.getTime() - now.getTime());
  console.log(
    "now",
    now.toISOString(),
    "graceUntil",
    graceUntil.toISOString(),
    "timeLeftMs",
    timeLeftMs
  );

  const respondPendingOrFailed = (reason: string, signature?: string) =>
    timeLeftMs > 0
      ? {
          valid: false,
          reason,
          signature,
          status: "pending" as const,
          timeLeftMs,
        }
      : {
          valid: false,
          reason: reason === "expired" ? "expired" : reason,
          signature,
          status: "failed" as const,
        };

  try {
    console.log(
      "Fetching signatures for wallet:",
      walletAddress,
      "limit:",
      SCAN_LIMIT
    );
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(walletAddress),
      { limit: SCAN_LIMIT }
    );
    console.log("Signatures count:", signatures.length);

    if (!signatures.length) return respondPendingOrFailed("onchain_not_found");

    // 1) Try to find a signature entry that already has memo text
    const matchedSignatureEntry = signatures.find((s) => {
      if (!s.memo) return false;
      // some RPCs return memo with length prefix "[44] ..." so just check contains
      return s.memo.includes(refStr) || s.memo === refStr;
    });

    let matchedSignature: string | undefined = matchedSignatureEntry?.signature;

    // 2) If not found, fallback to fetching parsedTxs and inspect the memo instruction
    if (!matchedSignature) {
      console.log(
        "No memo in signature list. Falling back to parsing transactions to find memo."
      );
      for (const sigEntry of signatures) {
        const sig = sigEntry.signature;
        try {
          const parsedTx = await connection.getParsedTransaction(sig, {
            commitment: "confirmed",
          });

          if (!parsedTx) continue;

          const instrs = parsedTx.transaction.message.instructions as (
            | ParsedInstruction
            | PartiallyDecodedInstruction
          )[];
          for (const instr of instrs) {
            if ("program" in instr && instr.program === "spl-memo") {
              // ParsedInstruction always has `parsed`
              if ("parsed" in instr) {
                const parsed = instr.parsed;
                if (
                  typeof parsed === "string" &&
                  (parsed === refStr || parsed.includes(refStr))
                ) {
                  matchedSignature = sig;
                  console.log(
                    "Found memo in parsedTx via instruction for signature:",
                    sig
                  );
                  break;
                }
              }
            }
          }
          if (matchedSignature) break;
        } catch (e) {
          console.warn("Error parsing tx for signature", sig, e);
          // continue searching other signatures
        }
      }
    } else {
      console.log("Found memo in signature list. signature:", matchedSignature);
    }

    if (!matchedSignature) {
      console.log("No transaction found with matching memo/reference.");
      return respondPendingOrFailed("onchain_not_found");
    }

    // Fetch parsedTx for matchedSignature to validate balances and get debug info
    const parsedTx = await connection.getParsedTransaction(matchedSignature, {
      commitment: "confirmed",
    });
    if (!parsedTx)
      return respondPendingOrFailed("tx_not_found", matchedSignature);

    console.log(
      "Parsed transaction found for matched signature:",
      matchedSignature
    );

    // Find recipient index in accountKeys
    const recipientIndex = parsedTx.transaction.message.accountKeys.findIndex(
      (k) => k.pubkey.toBase58() === walletAddress
    );
    console.log("Recipient index:", recipientIndex);
    if (recipientIndex === -1)
      return respondPendingOrFailed("recipient_not_in_tx", matchedSignature);

    const pre = parsedTx.meta?.preBalances?.[recipientIndex];
    const post = parsedTx.meta?.postBalances?.[recipientIndex];
    console.log("pre", pre, "post", post);
    if (pre === undefined || post === undefined)
      return respondPendingOrFailed("balance_data_missing", matchedSignature);

    const lamportsReceived = post - pre;
    const solReceived = lamportsReceived / 1_000_000_000;
    console.log(
      "lamportsReceived",
      lamportsReceived,
      "solReceived",
      solReceived,
      "expectedSol",
      expectedSol
    );

    if (solReceived < expectedSol) {
      // Not enough. if still time left -> pending, otherwise failed
      return respondPendingOrFailed("amount_mismatch", matchedSignature);
    }

    // Amount OK. If timeLeftMs <=0 it is still valid. Return confirmed with timeLeftMs (could be 0).
    return {
      valid: true,
      reason: "amount_ok",
      signature: matchedSignature,
      status: "confirmed",
      timeLeftMs,
    };
  } catch (err) {
    console.error("checkTransaction error:", err);
    return timeLeftMs > 0
      ? {
          valid: false,
          reason: "onchain_search_error",
          status: "pending",
          timeLeftMs,
        }
      : { valid: false, reason: "onchain_search_error", status: "failed" };
  }
}
