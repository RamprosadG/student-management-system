"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/ui/modals/Modal";
import Pagination from "@/components/ui/pagination/Pagination";
import { GradeEntryModal } from "@/features/results/GradeEntryModal";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";
import { ResultsHeader } from "@/components/features/results/ResultsHeader";
import { ResultsSummary } from "@/components/features/results/ResultsSummary";
import { ResultsFilters } from "@/components/features/results/ResultsFilters";
import { ResultsTable } from "@/components/features/results/ResultsTable";
import type {
  StaffGradingItem,
  ModuleItem,
  PublishFilter,
  StaffGradingSummary,
} from "@/types/results";
import type { PaginationMeta } from "@/types/pagination";

const PAGE_SIZE = 5;

export default function StaffResultsPage() {
  const [items, setItems] = useState<StaffGradingItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [summary, setSummary] = useState<StaffGradingSummary>({
    totalSubmissions: 0,
    gradedCount: 0,
    publishedCount: 0,
    withheldCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("ALL");
  const [gradingSubmission, setGradingSubmission] = useState<StaffGradingItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch("/api/modules");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setModules(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch modules:", err);
    }
  }, []);

  const fetchGradingList = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedModule !== "ALL") params.append("moduleId", selectedModule);
      if (publishFilter !== "ALL") params.append("publishStatus", publishFilter);
      params.append("page", String(page));
      params.append("pageSize", String(PAGE_SIZE));

      const res = await fetch(`/api/results?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        const list = Array.isArray(json.data.items) ? json.data.items : [];
        setItems(
          list.map((item: StaffGradingItem) => ({
            ...item,
            id: item.submissionId,
          }))
        );
        if (json.data.summary) {
          setSummary(json.data.summary);
        }
        setPagination(json.data.pagination || null);
      }
    } catch (err) {
      console.error("Failed to fetch grading items:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedModule, publishFilter, page]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    fetchGradingList();
  }, [fetchGradingList]);

  const handleTogglePublish = async (item: StaffGradingItem) => {
    if (item.grade === null) {
      showErrorAlert("Cannot publish an ungraded submission. Please record a grade first.");
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

      setItems((prev) =>
        prev.map((i) =>
          i.submissionId === item.submissionId
            ? { ...i, isPublished: nextState }
            : i
        )
      );
      setSummary((prev) => ({
        ...prev,
        publishedCount: prev.publishedCount + (nextState ? 1 : -1),
        withheldCount: prev.withheldCount + (nextState ? -1 : 1),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      showErrorAlert(message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <ResultsHeader isLoading={isLoading} onRefresh={fetchGradingList} />
      <ResultsSummary
        totalSubmissions={summary.totalSubmissions}
        gradedCount={summary.gradedCount}
        publishedCount={summary.publishedCount}
        withheldCount={summary.withheldCount}
      />
      <ResultsFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        selectedModule={selectedModule}
        onModuleChange={(value) => {
          setSelectedModule(value);
          setPage(1);
        }}
        publishFilter={publishFilter}
        onPublishFilterChange={(value) => {
          setPublishFilter(value);
          setPage(1);
        }}
        modules={modules}
      />
      <ResultsTable
        items={items}
        isLoading={isLoading}
        togglingId={togglingId}
        emptyMessage={
          search || selectedModule !== "ALL" || publishFilter !== "ALL"
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
          onPageChange={setPage}
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
              fetchGradingList();
            }}
            onClose={() => setGradingSubmission(null)}
          />
        )}
      </Modal>
    </div>
  );
}
