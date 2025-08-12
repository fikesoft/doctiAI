/*
  Warnings:

  - A unique constraint covering the columns `[userId,idempotencyKey]` on the table `crypto_transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `crypto_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "crypto_transactions" ADD COLUMN "idempotencyKey" VARCHAR(64);
UPDATE "crypto_transactions" SET "idempotencyKey" = gen_random_uuid()::text WHERE "idempotencyKey" IS NULL;
ALTER TABLE "crypto_transactions" ALTER COLUMN "idempotencyKey" SET NOT NULL;
CREATE UNIQUE INDEX "crypto_transactions_userId_idempotencyKey_key" ON "crypto_transactions"("userId", "idempotencyKey");