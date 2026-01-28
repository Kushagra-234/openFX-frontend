import { useState } from "react";
import "./App.css";
import type { QuoteResponse } from "./types/quote";
import { QuoteScreen } from "./screens/QuoteScreen";
import { ConfirmPayScreen } from "./screens/ConfirmPayScreen";
import { TransactionStatusScreen } from "./screens/TransactionStatusScreen";

type Step = "QUOTE" | "CONFIRM_PAY" | "STATUS";

const stepLabel: Record<Step, string> = {
  QUOTE: "Quote",
  CONFIRM_PAY: "Confirm & Pay",
  STATUS: "Status",
};

function App() {
  const [step, setStep] = useState<Step>("QUOTE");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleQuoteConfirmed = (confirmedQuote: QuoteResponse) => {
    setQuote(confirmedQuote);
    setStep("CONFIRM_PAY");
  };

  const handlePaid = (id: string) => {
    setTransactionId(id);
    setStep("STATUS");
  };

  const handleBackToQuote = () => {
    setStep("QUOTE");
  };

  const handleReset = () => {
    setQuote(null);
    setTransactionId(null);
    setStep("QUOTE");
  };

  return (
    <div className="app-root">
      <header className="app-header flex flex-col items-center gap-1 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          OpenFX
        </h1>
        <p className="app-subtitle text-sm">
          Simple cross-border payment flow demo
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs">
          {(["QUOTE", "CONFIRM_PAY", "STATUS"] as Step[]).map((s, index) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={
                  s === step
                    ? "rounded-full bg-emerald-500 text-slate-950 px-3 py-1 font-semibold"
                    : "rounded-full bg-slate-800 text-slate-200 px-3 py-1"
                }
              >
                {stepLabel[s]}
              </span>
              {index < 2 && <span className="text-slate-500">→</span>}
            </div>
          ))}
        </div>
      </header>
      <main className="app-main">
        {step === "QUOTE" && (
          <QuoteScreen onQuoteConfirmed={handleQuoteConfirmed} />
        )}
        {step === "CONFIRM_PAY" && quote && (
          <ConfirmPayScreen
            quote={quote}
            onPaid={handlePaid}
            onBack={handleBackToQuote}
          />
        )}
        {step === "STATUS" && transactionId && (
          <TransactionStatusScreen
            transactionId={transactionId}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

export default App;
