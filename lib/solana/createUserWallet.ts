import { Keypair } from "@solana/web3.js";
import { prisma } from "@/lib/prisma";
import { serializeSecret } from "./serializeSecret";

/** Creates a personal Solana wallet for the user if one doesn't exist. */
export async function createUserWallet(userId: number) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing)
    return { walletId: existing.id, walletAddress: existing.walletAddress };

  const keypair = Keypair.generate();
  const walletAddress = keypair.publicKey.toBase58();
  const secretPhrase = serializeSecret(keypair);

  const wallet = await prisma.wallet.create({
    data: { userId, walletAddress, secretPhrase },
  });

  return { walletId: wallet.id, walletAddress: wallet.walletAddress };
}
