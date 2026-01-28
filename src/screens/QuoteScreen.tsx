import type { QuoteResponse } from "../types/quote";

export interface QuoteScreenProps {
  onQuoteConfirmed: (quote: QuoteResponse) => void;
}

export function QuoteScreen(_props: QuoteScreenProps) {
  return (
    <div>
      <h1>Get FX Quote</h1>
      <p>Quote form and results will go here.</p>
    </div>
  );
}
