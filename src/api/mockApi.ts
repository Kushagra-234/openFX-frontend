import type { QuoteRequest, QuoteResponse } from "../types/quote";
import type { PayRequest, PayResponse } from "../types/payment";
import type {
  TransactionResponse,
  TransactionStatus,
} from "../types/transaction";

// Simple in-memory store to simulate backend state
const transactions = new Map<
  string,
  { status: TransactionStatus; createdAt: number }
>();

const randomId = () => Math.random().toString(36).slice(2, 10);

export async function postQuote(request: QuoteRequest): Promise<QuoteResponse> {
  // Simulate latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const rate = 1.1; // simple fixed rate for now
  const fees = Math.max(1, request.amount * 0.01);
  const totalPayable = request.amount + fees;
  const expiresAt = new Date(Date.now() + 30_000).toISOString();

  return {
    id: randomId(),
    sourceCurrency: request.sourceCurrency,
    destinationCurrency: request.destinationCurrency,
    amount: request.amount,
    rate,
    fees,
    totalPayable,
    expiresAt,
  };
}

export async function postPay(_request: PayRequest): Promise<PayResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const transactionId = randomId();
  transactions.set(transactionId, {
    status: "PROCESSING",
    createdAt: Date.now(),
  });

  return { transactionId };
}

export async function getTransaction(id: string): Promise<TransactionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const record = transactions.get(id);
  if (!record) {
    // Simulate 404-ish behavior
    throw new Error("Transaction not found");
  }

  const elapsed = Date.now() - record.createdAt;

  let status: TransactionStatus = record.status;
  if (elapsed > 12_000 && status !== "FAILED") {
    status = "SETTLED";
  } else if (elapsed > 6_000 && status === "PROCESSING") {
    status = "SENT";
  }

  record.status = status;
  transactions.set(id, record);

  return {
    id,
    status,
    updatedAt: new Date().toISOString(),
  };
}
