"use client";

import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import type { ModuleData } from "@/types/staff-assessments";

interface AssessmentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedModuleId: string;
  onModuleChange: (value: string) => void;
  modules: ModuleData[];
}

export function AssessmentsFilters({
  search,
  onSearchChange,
  selectedModuleId,
  onModuleChange,
  modules,
}: AssessmentsFiltersProps) {
  const moduleFilterOptions = [
    { value: "ALL", label: "All Modules" },
    ...modules.map((m) => ({
      value: m.id,
      label: `${m.code} - ${m.title}`,
    })),
  ];

  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search assessment title or module code/name..."
        />
      </div>

      <div className="w-full sm:w-60 shrink-0">
        <Dropdown
          options={moduleFilterOptions}
          value={selectedModuleId}
          onChange={onModuleChange}
        />
      </div>
    </div>
  );
}
