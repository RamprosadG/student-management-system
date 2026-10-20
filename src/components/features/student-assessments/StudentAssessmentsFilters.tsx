"use client";

import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";

interface StudentAssessmentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

const statusDropdownOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending Submission" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "LATE", label: "Overdue / Late" },
];

export function StudentAssessmentsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: StudentAssessmentsFiltersProps) {
  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search by assessment or module..."
        />
      </div>

      <div className="w-full sm:w-60 shrink-0">
        <Dropdown
          options={statusDropdownOptions}
          value={statusFilter}
          onChange={onStatusChange}
          placeholder="Filter Status"
        />
      </div>
    </div>
  );
}
