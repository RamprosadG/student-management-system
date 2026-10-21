import type { ReactNode } from "react";

interface AssessmentsHeaderProps {
  actions: ReactNode;
}

export function AssessmentsHeader({ actions }: AssessmentsHeaderProps) {
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
      <div className="flex items-center gap-3">{actions}</div>
    </div>
  );
}
