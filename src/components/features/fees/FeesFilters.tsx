"use client";

import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";

interface FeesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

const statusFilterOptions = [
  { value: "ALL", label: "All Payment Statuses" },
  { value: "PAID", label: "Paid in Full" },
  { value: "PARTIAL", label: "Partial Balance" },
  { value: "OVERDUE", label: "Overdue" },
];

export function FeesFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: FeesFiltersProps) {
  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search student name, ID or email..."
        />
      </div>

      <div className="w-full sm:w-60 shrink-0">
        <Dropdown
          options={statusFilterOptions}
          value={statusFilter}
          onChange={onStatusChange}
          placeholder="Filter Payment Status"
        />
      </div>
    </div>
  );
}
