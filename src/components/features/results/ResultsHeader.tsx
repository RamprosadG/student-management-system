"use client";

import Button from "@/components/ui/buttons/Button";
import { HiRefresh } from "react-icons/hi";

interface ResultsHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function ResultsHeader({ isLoading, onRefresh }: ResultsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Marksheet & Results Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter assessment grades (0–100), apply academic classifications, and manage publish/withhold controls.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary-outline"
          size="md"
          icon={<HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          onClick={onRefresh}
          disabled={isLoading}
        >
          Refresh Ledger
        </Button>
      </div>
    </div>
  );
}
