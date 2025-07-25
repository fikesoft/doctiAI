import crypto from "crypto";

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY!;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    "WALLET_ENCRYPTION_KEY missing or not 32 bytes (64 hex chars)"
  );
}
const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
const ALGO = "aes-256-gcm";

/**
 * Encrypt plaintext (Buffer/string) with AES-256-GCM
 * Returns base64 string: IV:ciphertext:authTag
 */
export function encryptWalletSecret(secret: Buffer | string): string {
  const iv = crypto.randomBytes(12); // GCM uses 12 bytes IV
  const cipher = crypto.createCipheriv(ALGO, keyBuffer, iv);

  const plaintext =
    typeof secret === "string" ? Buffer.from(secret, "utf8") : secret;
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store as base64: iv:encrypted:authTag
  return [
    iv.toString("base64"),
    encrypted.toString("base64"),
    authTag.toString("base64"),
  ].join(":");
}

/**
 * Decrypt base64 string produced by encryptWalletSecret
 */
export function decryptWalletSecret(encrypted: string): Buffer {
  const [ivB64, encryptedB64, tagB64] = encrypted.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(encryptedB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");

  const decipher = crypto.createDecipheriv(ALGO, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted;
}
