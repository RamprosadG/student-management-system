"use client";

import Button from "@/components/ui/buttons/Button";
import { HiRefresh, HiPlus } from "react-icons/hi";

interface AssessmentsHeaderProps {
  onRefresh: () => void;
  onCreate: () => void;
}

export function AssessmentsHeader({ onRefresh, onCreate }: AssessmentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Assessments & Submissions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create module assessments, manage deadlines, and inspect student delivery timestamps.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="md"
          icon={<HiRefresh className="w-4 h-4" />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={<HiPlus className="w-4 h-4" />}
          onClick={onCreate}
        >
          Create Assessment
        </Button>
      </div>
    </div>
  );
}
