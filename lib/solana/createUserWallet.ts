import { Keypair } from "@solana/web3.js";
import { prisma } from "@/lib/prisma";
import { serializeSecret } from "./serializeSecret";

/** Creates a personal Solana wallet for the user if one doesn't exist. */
export async function createUserWallet(userId: number) {
  // Check if user already has a wallet
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  //If has it then return wallet
  if (existing)
    return { wallletAdress: existing.walletAddress, wallletId: existing.id };

  // Generate new wallet
  // Keypair contains both a public key (the wallet address) and a secret key (private, used for signing).

  const keypair = Keypair.generate();
  // Converts the wallet’s public key to a string (Base58, which is the standard Solana wallet address format).
  const walletAddress = keypair.publicKey.toBase58();
  /**Serializes the secret key for storage:
   * In development, this is just a base64 string.
   * In production, this is encrypted with your secret key. */
  const secretPhrase = serializeSecret(keypair);

  // Store wallet in DB
  const wallet = await prisma.wallet.create({
    data: {
      userId,
      walletAddress,
      secretPhrase,
    },
  });

  return { wallletAdress: wallet.walletAddress, wallletId: wallet.id };
}
