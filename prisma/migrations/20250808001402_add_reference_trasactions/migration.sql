/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `crypto_transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `crypto_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "crypto_transactions" ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "crypto_transactions_reference_key" ON "crypto_transactions"("reference");
