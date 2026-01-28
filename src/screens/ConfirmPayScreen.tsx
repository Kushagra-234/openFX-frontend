import { useState } from "react";
import type { QuoteResponse } from "../types/quote";
import { postPay } from "../api/mockApi";
import type { PayResponse } from "../types/payment";

export interface ConfirmPayScreenProps {
  quote: QuoteResponse;
  onPaid: (transactionId: string) => void;
  onBack: () => void;
}

export function ConfirmPayScreen({
  quote,
  onPaid,
  onBack,
}: ConfirmPayScreenProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isQuoteExpired = new Date(quote.expiresAt).getTime() <= Date.now();

  const handlePay = async () => {
    if (isPaying) return;
    if (isQuoteExpired) {
      setError("This quote has expired. Please go back and refresh the quote.");
      return;
    }

    setIsPaying(true);
    setError(null);
    try {
      const response: PayResponse = await postPay({ quoteId: quote.id });
      onPaid(response.transactionId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while processing payment.";
      setError(message);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="panel bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Confirm payment</h2>
          <p className="text-sm text-slate-400">
            Review your quote details before sending the payment.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          disabled={isPaying}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
      </div>

      <div className="quote-summary space-y-3 rounded-2xl bg-slate-900 border border-slate-800 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Pair</span>
          <span className="font-medium">
            {quote.sourceCurrency} → {quote.destinationCurrency}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Amount</span>
          <span>{quote.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Rate</span>
          <span>{quote.rate.toFixed(4)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Fees</span>
          <span>{quote.fees.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
          <span className="text-slate-400">Total payable</span>
          <span className="font-semibold">
            {quote.totalPayable.toFixed(2)} {quote.sourceCurrency}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-banner text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {isQuoteExpired && !error && (
        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-xl px-3 py-2">
          Quote expired. Go back to refresh.
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={isPaying || isQuoteExpired}
        className="primary-button inline-flex items-center justify-center w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPaying ? "Processing payment…" : "Pay now"}
      </button>
    </div>
  );
}
