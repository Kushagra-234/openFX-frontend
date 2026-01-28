export type CurrencyCode = "USD" | "EUR" | "INR" | "GBP";

export interface QuoteRequest {
  sourceCurrency: CurrencyCode;
  destinationCurrency: CurrencyCode;
  amount: number;
}

export interface QuoteResponse {
  id: string;
  sourceCurrency: CurrencyCode;
  destinationCurrency: CurrencyCode;
  amount: number;
  rate: number;
  fees: number;
  totalPayable: number;
  /** ISO timestamp when the quote expires */
  expiresAt: string;
}
