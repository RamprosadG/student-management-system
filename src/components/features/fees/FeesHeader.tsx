"use client";

import Button from "@/components/ui/buttons/Button";
import { HiRefresh } from "react-icons/hi";

interface FeesHeaderProps {
  onRefresh: () => void;
}

export function FeesHeader({ onRefresh }: FeesHeaderProps) {
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
        <Button
          variant="secondary-outline"
          size="md"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={onRefresh}
        >
          Refresh Ledger
        </Button>
      </div>
    </div>
  );
}
