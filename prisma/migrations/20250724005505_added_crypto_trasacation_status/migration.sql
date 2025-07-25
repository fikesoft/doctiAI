-- AlterTable
ALTER TABLE "crypto_transactions" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "txSignature" DROP NOT NULL;
