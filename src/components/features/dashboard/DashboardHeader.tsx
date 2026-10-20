"use client";

import Button from "@/components/ui/buttons/Button";
import { HiRefresh } from "react-icons/hi";

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ isLoading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
            Registry Command Center
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Registry Administrative Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time financial status, urgent overdue accounts, grading progress, and curriculum submissions.
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
          Refresh Dashboard
        </Button>
      </div>
    </div>
  );
}
