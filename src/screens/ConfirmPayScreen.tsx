import type { QuoteResponse } from "../types/quote";

export interface ConfirmPayScreenProps {
  quote: QuoteResponse;
  onPaid: (transactionId: string) => void;
}

export function ConfirmPayScreen(_props: ConfirmPayScreenProps) {
  return (
    <div>
      <h1>Confirm and Pay</h1>
      <p>Payment confirmation and pay button will go here.</p>
    </div>
  );
}
