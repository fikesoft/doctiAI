/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `crypto_transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `crypto_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "crypto_transactions" ADD COLUMN "reference" TEXT;
UPDATE "crypto_transactions" SET "reference" = gen_random_uuid()::text WHERE "reference" IS NULL;
ALTER TABLE "crypto_transactions" ALTER COLUMN "reference" SET NOT NULL;
CREATE UNIQUE INDEX "crypto_transactions_reference_key" ON "crypto_transactions"("reference");