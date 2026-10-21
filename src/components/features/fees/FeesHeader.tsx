import { FeesRefreshButton } from "./FeesRefreshButton";

export function FeesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Fees & Payments
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track programme fee assignments, record transactions, and monitor real-time balances.
        </p>
      </div>
      <div>
        <FeesRefreshButton />
      </div>
    </div>
  );
}
