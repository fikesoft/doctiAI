export interface DepositRequestBody {
  usd: number;
}

export interface DepositResponse {
  cryptoTransactionId: number;
  recipient: string;
  sol: string;
  reference: string;
  expiresAt: string;
  solanaPayUrl: string;
}

export interface TransactionSerialized {
  cryptoAmount: string;
  fiatAmount: string;
  status: string;
  id: number;
  createdAt: Date;
  idempotencyKey: string;
}
export interface ErrorResponse {
  error: string;
}
