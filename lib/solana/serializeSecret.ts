import { Keypair } from "@solana/web3.js";
import {
  decryptWalletSecret,
  encryptWalletSecret,
} from "@/lib/crypto/encryption"; // path as needed

const isProd = process.env.APP_STATE === "production";

/**
 * Serializes (encrypts/base64s) a Solana keypair's secret key for DB storage.
 */
export function serializeSecret(keypair: Keypair): string {
  const buf = Buffer.from(keypair.secretKey);
  return isProd ? encryptWalletSecret(buf) : buf.toString("base64");
}
/**
 * Deserialize (decrypt/base64-decode) secret string into a Keypair.
 */
export function deserializeSecret(secret: string): Keypair {
  const buf = isProd
    ? decryptWalletSecret(secret)
    : Buffer.from(secret, "base64");
  return Keypair.fromSecretKey(buf);
}
