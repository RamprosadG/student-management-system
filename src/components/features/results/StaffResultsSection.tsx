"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Modal from "@/components/ui/modals/Modal";
import Pagination from "@/components/ui/pagination/Pagination";
import { GradeEntryModal } from "@/features/results/GradeEntryModal";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";
import { ResultsFilters } from "./ResultsFilters";
import { ResultsTable } from "./ResultsTable";
import type {
  StaffGradingItem,
  StaffResultsFilters,
  ModuleItem,
} from "@/types/staff-results";
import type { PaginationMeta } from "@/types/pagination";

interface StaffResultsSectionProps {
  items: StaffGradingItem[];
  modules: ModuleItem[];
  pagination: PaginationMeta | null;
  filters: StaffResultsFilters;
  isLoading?: boolean;
}

export function StaffResultsSection({
  items,
  modules,
  pagination,
  filters,
  isLoading = false,
}: StaffResultsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Mutations refetch on their own transition so the table keeps showing rows
  // while the per-row action spinner runs.
  const [, startRefresh] = useTransition();
  const [gradingSubmission, setGradingSubmission] =
    useState<StaffGradingItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filter and page state lives in the URL, so the ledger can be rendered on the server.
  const navigate = (changes: Partial<StaffResultsFilters>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.moduleId && next.moduleId !== "ALL") {
      params.set("moduleId", next.moduleId);
    }
    if (next.publishFilter !== "ALL") {
      params.set("publishStatus", next.publishFilter);
    }
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startRefresh(() => router.refresh());

  const handleTogglePublish = async (item: StaffGradingItem) => {
    if (item.grade === null) {
      showErrorAlert(
        "Cannot publish an ungraded submission. Please record a grade first."
      );
      return;
    }

    setTogglingId(item.submissionId);
    try {
      const nextState = !item.isPublished;
      const res = await fetch("/api/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: item.submissionId,
          isPublished: nextState,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update publication status");
      }

      showSuccessAlert(
        nextState
          ? "Grade published to student marksheet"
          : "Grade withheld from student view"
      );

      // Grades and KPI counters are both server reads, so refetch instead of patching local state.
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      showErrorAlert(message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <ResultsFilters
        search={filters.search}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        selectedModule={filters.moduleId}
        onModuleChange={(value) => navigate({ moduleId: value, page: 1 })}
        publishFilter={filters.publishFilter}
        onPublishFilterChange={(value) => navigate({ publishFilter: value, page: 1 })}
        modules={modules}
      />
      <ResultsTable
        items={items}
        isLoading={isLoading || isPending}
        togglingId={togglingId}
        emptyMessage={
          filters.search ||
          filters.moduleId !== "ALL" ||
          filters.publishFilter !== "ALL"
            ? "No submission records match your filter criteria."
            : "No student submissions recorded yet. Students can submit work in the Student Portal."
        }
        onGrade={setGradingSubmission}
        onTogglePublish={handleTogglePublish}
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
        isOpen={Boolean(gradingSubmission)}
        onClose={() => setGradingSubmission(null)}
        title={
          gradingSubmission?.grade !== null
            ? `Update Grade: ${gradingSubmission?.studentName || ""}`
            : `Enter Grade: ${gradingSubmission?.studentName || ""}`
        }
      >
        {gradingSubmission && (
          <GradeEntryModal
            submission={gradingSubmission}
            onSuccess={() => {
              setGradingSubmission(null);
              refresh();
            }}
            onClose={() => setGradingSubmission(null)}
          />
        )}
      </Modal>
    </>
  );
}
