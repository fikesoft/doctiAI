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

export interface ErrorResponse {
  error: string;
}
