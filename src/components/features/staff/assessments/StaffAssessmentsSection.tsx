"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Modal from "@/components/ui/modals/Modal";
import Pagination from "@/components/ui/pagination/Pagination";
import { SubmissionInspectorModal } from "@/features/assessments/SubmissionInspectorModal";
import { AssessmentsFilters } from "./AssessmentsFilters";
import { AssessmentsTable } from "./AssessmentsTable";
import type {
  AssessmentItem,
  ModuleData,
  StaffAssessmentsFilters,
} from "@/types/assessments";
import type { PaginationMeta } from "@/types/pagination";

interface StaffAssessmentsSectionProps {
  assessments: AssessmentItem[];
  modules: ModuleData[];
  pagination: PaginationMeta | null;
  filters: StaffAssessmentsFilters;
}

export function StaffAssessmentsSection({
  assessments,
  modules,
  pagination,
  filters,
}: StaffAssessmentsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [inspectedAssessment, setInspectedAssessment] =
    useState<AssessmentItem | null>(null);

  // Filter and page state lives in the URL, so the list itself can be rendered on the server.
  const navigate = (changes: Partial<StaffAssessmentsFilters>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.moduleId && next.moduleId !== "ALL") {
      params.set("moduleId", next.moduleId);
    }
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <>
      <AssessmentsFilters
        search={filters.search}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        selectedModuleId={filters.moduleId}
        onModuleChange={(value) => navigate({ moduleId: value, page: 1 })}
        modules={modules}
      />
      <AssessmentsTable
        assessments={assessments}
        isLoading={isPending}
        onInspect={setInspectedAssessment}
      />

      {pagination && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => navigate({ page })}
          total={pagination.total}
          limit={pagination.pageSize}
        />
      )}

      <Modal
        isOpen={Boolean(inspectedAssessment)}
        onClose={() => setInspectedAssessment(null)}
        title="Submission Inspector"
        className="max-w-3xl"
      >
        {inspectedAssessment && (
          <SubmissionInspectorModal
            assessment={inspectedAssessment}
            submissions={inspectedAssessment.submissions}
            onClose={() => setInspectedAssessment(null)}
          />
        )}
      </Modal>
    </>
  );
}
