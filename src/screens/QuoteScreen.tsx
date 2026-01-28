import { useEffect, useMemo, useState } from "react";
import type { CurrencyCode, QuoteResponse } from "../types/quote";
import { postQuote } from "../api/mockApi";

export interface QuoteScreenProps {
  onQuoteConfirmed: (quote: QuoteResponse) => void;
}

interface CountdownState {
  secondsRemaining: number;
  isExpired: boolean;
}

function useQuoteCountdown(expiresAt?: string | null): CountdownState {
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsRemaining(0);
      return;
    }

    const expiryTime = new Date(expiresAt).getTime();

    const update = () => {
      const diffMs = expiryTime - Date.now();
      const next = Math.max(0, Math.ceil(diffMs / 1000));
      setSecondsRemaining(next);
    };

    update();
    const id = window.setInterval(update, 500);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return { secondsRemaining, isExpired: secondsRemaining <= 0 && !!expiresAt };
}

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "INR", "GBP"];

export function QuoteScreen({ onQuoteConfirmed }: QuoteScreenProps) {
  const [sourceCurrency, setSourceCurrency] = useState<CurrencyCode>("USD");
  const [destinationCurrency, setDestinationCurrency] =
    useState<CurrencyCode>("INR");
  const [amount, setAmount] = useState("1000");

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { secondsRemaining, isExpired } = useQuoteCountdown(quote?.expiresAt);

  const isContinueDisabled = useMemo(() => {
    return !quote || isExpired;
  }, [quote, isExpired]);

  const handleGetQuote = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (sourceCurrency === destinationCurrency) {
      setError("Source and destination currencies must be different.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await postQuote({
        sourceCurrency,
        destinationCurrency,
        amount: parsedAmount,
      });
      setQuote(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch quote.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (!quote) return;
    void handleGetQuote();
  };

  const handleContinue = () => {
    if (!quote || isExpired) return;
    onQuoteConfirmed(quote);
  };

  const formattedExpiry = quote
    ? new Date(quote.expiresAt).toLocaleTimeString()
    : null;

  return (
    <div className="panel bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-1">Get FX Quote</h2>
      <p className="text-sm text-slate-400">
        Choose currencies and amount to see a live FX quote.
      </p>

      <form
        className="quote-form space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleGetQuote();
        }}
      >
        <div className="field-row grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-slate-200 space-y-1">
            <span>Source currency</span>
            <select
              value={sourceCurrency}
              onChange={(event) =>
                setSourceCurrency(event.target.value as CurrencyCode)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-200 space-y-1">
            <span>Destination currency</span>
            <select
              value={destinationCurrency}
              onChange={(event) =>
                setDestinationCurrency(event.target.value as CurrencyCode)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field-column flex flex-col gap-1 text-sm font-medium text-slate-200">
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>

        {error && (
          <div className="error-banner text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="primary-button inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Getting quote…" : "Get Quote"}
        </button>
      </form>

      {quote && (
        <div className="quote-result mt-4 space-y-3 rounded-2xl bg-slate-900 border border-slate-800 p-4 text-sm">
          <h3 className="text-sm font-semibold text-slate-100">
            Quote details
          </h3>
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
          <div className="quote-expiry flex items-center justify-between text-xs text-slate-400 mt-1">
            {isExpired ? (
              <span className="expired text-red-400">Quote expired</span>
            ) : (
              <span>
                Expires in {secondsRemaining}s
                {formattedExpiry ? ` (at ${formattedExpiry})` : ""}
              </span>
            )}
          </div>

          <div className="quote-actions mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              className="secondary-button inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              Refresh quote
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isContinueDisabled}
              className="primary-button inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
