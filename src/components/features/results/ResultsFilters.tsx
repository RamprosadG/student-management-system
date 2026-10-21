"use client";

import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import type { ModuleItem, PublishFilter } from "@/types/staff-results";

interface ResultsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedModule: string;
  onModuleChange: (value: string) => void;
  publishFilter: PublishFilter;
  onPublishFilterChange: (value: PublishFilter) => void;
  modules: ModuleItem[];
}

const publishFilterOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "WITHHELD", label: "Withheld (Draft)" },
  { value: "UNGRADED", label: "Pending Grading" },
];

export function ResultsFilters({
  search,
  onSearchChange,
  selectedModule,
  onModuleChange,
  publishFilter,
  onPublishFilterChange,
  modules,
}: ResultsFiltersProps) {
  const moduleDropdownOptions = [
    { value: "ALL", label: "All Modules" },
    ...modules.map((m) => ({
      value: m.id,
      label: m.programme?.code
        ? `${m.code} - ${m.title} (${m.programme.code})`
        : `${m.code} - ${m.title}`,
    })),
  ];

  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search by student, ID, or assessment..."
        />
      </div>

      <div className="w-full sm:w-60 shrink-0">
        <Dropdown
          options={moduleDropdownOptions}
          value={selectedModule}
          onChange={onModuleChange}
          placeholder="Filter by Module"
        />
      </div>

      <div className="w-full sm:w-52 shrink-0">
        <Dropdown
          options={publishFilterOptions}
          value={publishFilter}
          onChange={(val) => onPublishFilterChange(val as PublishFilter)}
          placeholder="Filter Publication Status"
        />
      </div>
    </div>
  );
}
