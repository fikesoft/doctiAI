/*
  Warnings:

  - Added the required column `expiresAt` to the `crypto_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "crypto_transactions" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "crypto_transactions_status_expiresAt_idx" ON "crypto_transactions"("status", "expiresAt");
