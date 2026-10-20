"use client";

import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import type { ReferenceMeta } from "@/types/students";

interface StudentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedProgramme: string;
  onProgrammeChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  meta: ReferenceMeta;
}

const statusFilterOptions = [
  { value: "", label: "All Statuses" },
  { value: "ENROLLED", label: "Enrolled" },
  { value: "DEFERRED", label: "Deferred" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "COMPLETED", label: "Completed" },
];

export function StudentsFilters({
  search,
  onSearchChange,
  selectedProgramme,
  onProgrammeChange,
  selectedStatus,
  onStatusChange,
  meta,
}: StudentsFiltersProps) {
  const programmeFilterOptions = [
    { value: "", label: "All Programmes" },
    ...meta.programmes.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.code})`,
    })),
  ];

  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search by name, ID or email..."
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
        <div className="w-full sm:w-64">
          <Dropdown
            options={programmeFilterOptions}
            value={selectedProgramme}
            onChange={onProgrammeChange}
            placeholder="Filter by Programme"
          />
        </div>

        <div className="w-full sm:w-48">
          <Dropdown
            options={statusFilterOptions}
            value={selectedStatus}
            onChange={onStatusChange}
            placeholder="Filter Status"
          />
        </div>
      </div>
    </div>
  );
}
