export type TransactionStatus = "PROCESSING" | "SENT" | "SETTLED" | "FAILED";

export interface TransactionResponse {
  id: string;
  status: TransactionStatus;
  /** ISO timestamp of last update */
  updatedAt: string;
}
