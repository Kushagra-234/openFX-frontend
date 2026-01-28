import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTransaction } from "../api/mockApi";
import type {
  TransactionResponse,
  TransactionStatus,
} from "../types/transaction";

export interface TransactionStatusScreenProps {
  transactionId: string;
  onReset: () => void;
}

const isFinalStatus = (status: TransactionStatus) =>
  status === "SETTLED" || status === "FAILED";

const statusLabel: Record<TransactionStatus, string> = {
  PROCESSING: "Processing",
  SENT: "Sent",
  SETTLED: "Settled",
  FAILED: "Failed",
};

function statusStyle(status: TransactionStatus) {
  switch (status) {
    case "PROCESSING":
      return "bg-sky-500/10 text-sky-300 border-sky-500/30";
    case "SENT":
      return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
    case "SETTLED":
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    case "FAILED":
      return "bg-red-500/10 text-red-300 border-red-500/30";
  }
}

export function TransactionStatusScreen({
  transactionId,
  onReset,
}: TransactionStatusScreenProps) {
  const [data, setData] = useState<TransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const pollTimerRef = useRef<number | null>(null);

  const fetchOnce = useCallback(async () => {
    setError(null);
    try {
      const response = await getTransaction(transactionId);
      setData(response);
      return response;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch transaction status.";
      setError(message);
      throw err;
    }
  }, [transactionId]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      setIsLoading(true);
      try {
        const first = await fetchOnce();
        if (cancelled) return;

        setIsLoading(false);
        if (isFinalStatus(first.status)) return;

        if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = window.setInterval(async () => {
          try {
            const next = await fetchOnce();
            if (isFinalStatus(next.status) && pollTimerRef.current) {
              window.clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }
          } catch {
            // keep polling; user can retry manually as well
          }
        }, 2500);
      } catch {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [fetchOnce, retryCount]);

  const currentStatus: TransactionStatus | null = data?.status ?? null;
  const statusPillClass = useMemo(() => {
    if (!currentStatus) return "bg-slate-800 text-slate-200 border-slate-700";
    return statusStyle(currentStatus);
  }, [currentStatus]);

  const updatedAtText = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString()
    : null;

  const handleRetryNow = () => {
    setRetryCount((c) => c + 1);
  };

  const headline = currentStatus ? statusLabel[currentStatus] : "Loading";
  const message = (() => {
    if (!currentStatus) return "Fetching latest transaction status.";
    if (currentStatus === "PROCESSING")
      return "Your payment is being processed.";
    if (currentStatus === "SENT")
      return "Funds have been sent. Waiting for settlement.";
    if (currentStatus === "SETTLED") return "Payment settled successfully.";
    return "Payment failed. Please try again or contact support.";
  })();

  return (
    <div className="panel bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Transaction status</h2>
          <p className="text-sm text-slate-400">
            Tracking ID:{" "}
            <span className="text-slate-200 font-mono">{transactionId}</span>
          </p>
        </div>

        <span
          className={`inline-flex items-center justify-center rounded-2xl border px-3 py-2 text-xs font-semibold ${statusPillClass}`}
        >
          {headline}
        </span>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2">
        <p className="text-sm text-slate-100">{message}</p>
        {updatedAtText && (
          <p className="text-xs text-slate-400">
            Last updated at {updatedAtText}
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-xl px-3 py-2">
          <div className="font-medium">Temporary error</div>
          <div className="text-xs text-amber-200/80">{error}</div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        {!isFinalStatus(currentStatus ?? "PROCESSING") && (
          <button
            type="button"
            onClick={handleRetryNow}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Retry now
          </button>
        )}

        {currentStatus === "FAILED" && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Start new transfer
          </button>
        )}

        {currentStatus === "SETTLED" && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Done
          </button>
        )}
      </div>

      {isLoading && <div className="text-xs text-slate-400">Loading…</div>}
    </div>
  );
}
