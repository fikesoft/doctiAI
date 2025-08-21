import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";
import bs58 from "bs58";

// Connect to Devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Load Phantom secret key from env (base58 string)
const secretKeyBase58 = process.env.PRIVATE_KEY!;
if (!secretKeyBase58) throw new Error("Missing PRIVATE_KEY in env");

const payer = Keypair.fromSecretKey(bs58.decode(secretKeyBase58));

export async function makeAndSendTransaction({
  amountSol,
  reference,
  recipient,
}: {
  amountSol: number;
  reference?: string;
  recipient: string;
}) {
  if (!recipient) throw new Error("Recipient is required");
  if (!amountSol || amountSol <= 0) throw new Error("Invalid amountSol");

  const recipientPubkey = new PublicKey(recipient);
  /*
  console.log("=== DEBUG INFO ===");
  console.log("Payer PublicKey:", payer.publicKey.toBase58());
  console.log("Recipient PublicKey:", recipientPubkey.toBase58());
  console.log("Amount SOL:", amountSol);*/

  //const payerBalance = await connection.getBalance(payer.publicKey);
  //console.log("Payer balance (SOL):", payerBalance / LAMPORTS_PER_SOL);

  // Build transfer instruction
  const transferIx = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipientPubkey,
    lamports: amountSol * LAMPORTS_PER_SOL,
  });

  const transaction = new Transaction().add(transferIx);

  // Optional memo
  if (reference) {
    transaction.add(createMemoInstruction(reference, []));
    //console.log("Memo added:", reference);
  }

  // Explicit fee payer & recent blockhash
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer.publicKey;

  //console.log("Transaction instructions:", transaction.instructions);

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);
    console.log("Transaction signature:", signature);
    return { signature };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Transaction send failed:", err.message);
      return { error: err.message };
    }

    console.error("Transaction send failed:", err);
    return { error: String(err) };
  }
}
