BEGIN;

-- Salvează mapping-ul wallets
CREATE TABLE IF NOT EXISTS tmp_wallet_map AS
SELECT id AS wallet_id, "walletAddress"
FROM wallets;

-- Adaugă coloana walletAddress în crypto_transactions
ALTER TABLE crypto_transactions
ADD COLUMN IF NOT EXISTS "walletAddress" TEXT;

-- Populează walletAddress din walletId
UPDATE crypto_transactions ct
SET "walletAddress" = twm."walletAddress"
FROM tmp_wallet_map twm
WHERE ct."walletId" = twm.wallet_id AND ct."walletAddress" IS NULL;

-- (OPTIONAL) setează STATIC_ADDRESS pentru tranzacțiile fără adresă
-- UPDATE crypto_transactions SET "walletAddress" = '<STATIC_ADDRESS>' WHERE "walletAddress" IS NULL;

-- Dropează FK-ul și coloana walletId
ALTER TABLE crypto_transactions DROP CONSTRAINT IF EXISTS crypto_transactions_walletid_fkey;
ALTER TABLE crypto_transactions DROP COLUMN IF EXISTS "walletId";

-- (Opțional) șterge tabela wallets dacă ești sigur
DROP TABLE IF EXISTS wallets CASCADE;

-- Curățenie
DROP TABLE IF EXISTS tmp_wallet_map;

COMMIT;
