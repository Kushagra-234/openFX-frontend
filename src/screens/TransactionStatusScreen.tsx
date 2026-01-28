export interface TransactionStatusScreenProps {
  transactionId: string;
  onReset: () => void;
}

export function TransactionStatusScreen(_props: TransactionStatusScreenProps) {
  return (
    <div>
      <h1>Transaction Status</h1>
      <p>Status details and polling will go here.</p>
    </div>
  );
}
