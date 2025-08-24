import {
  Connection,
  ParsedInstruction,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";
import { prisma } from "../prisma";
import { TransactionCheckedReturn } from "@/types/api";
const IS_DEV = process.env.APP_STATE !== "production";
const QUICKNODE =
  process.env.APP_STATE === "production"
    ? process.env.QUICKNODE_PROD!
    : process.env.QUICKNODE_DEV!;
const connection = new Connection(QUICKNODE, "confirmed");
const SCAN_LIMIT = 500;

export async function checkTransaction(
  reference: PublicKey,
  expectedSol: number
): Promise<TransactionCheckedReturn> {
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

    let matchedSignature: string | undefined;

    if (IS_DEV) {
      // --- DEV mode: look for memo ---
      console.log("DEV mode: searching for memo");
      const matchedSignatureEntry = signatures.find(
        (s) => s.memo && (s.memo.includes(refStr) || s.memo === refStr)
      );
      matchedSignature = matchedSignatureEntry?.signature;

      if (!matchedSignature) {
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
                if ("parsed" in instr && typeof instr.parsed === "string") {
                  if (
                    instr.parsed === refStr ||
                    instr.parsed.includes(refStr)
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
          }
        }
      } else {
        console.log(
          "Found memo in signature list. signature:",
          matchedSignature
        );
      }
    } else {
      // --- PROD mode: look for reference in account keys ---
      console.log("PROD mode: searching in account keys");
      for (const sigEntry of signatures) {
        const sig = sigEntry.signature;
        const parsedTx = await connection.getParsedTransaction(sig, {
          commitment: "confirmed",
        });
        if (!parsedTx) continue;

        const accKeys = parsedTx.transaction.message.accountKeys.map((k) =>
          k.pubkey.toBase58()
        );
        if (accKeys.includes(refStr)) {
          matchedSignature = sig;
          console.log("Found reference in account keys:", sig);
          break;
        }
      }
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

    const expectedLamports = Math.floor(expectedSol * 1_000_000_000);
    const TOLERANCE = 10_000; // ~0.00001 SOL

    if (lamportsReceived >= expectedLamports) {
      // user sent enough or more
    } else if (expectedLamports - lamportsReceived <= TOLERANCE) {
      // user sent slightly less, but within tolerance
    } else {
      return respondPendingOrFailed("amount_mismatch", matchedSignature);
    }

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
