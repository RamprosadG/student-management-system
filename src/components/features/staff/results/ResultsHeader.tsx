import { ResultsRefreshButton } from "./ResultsRefreshButton";

export function ResultsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 max-sm:text-lg">
          Marksheet & Results Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 max-sm:hidden">
          Enter assessment grades (0–100), apply academic classifications, and manage publish/withhold controls.
        </p>
      </div>

      <div className="flex items-center gap-3 max-sm:hidden">
        <ResultsRefreshButton />
      </div>
    </div>
  );
}
