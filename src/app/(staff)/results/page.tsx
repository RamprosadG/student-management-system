"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/ui/modals/Modal";
import { GradeEntryModal } from "@/features/results/GradeEntryModal";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";
import { ResultsHeader } from "@/components/features/results/ResultsHeader";
import { ResultsSummary } from "@/components/features/results/ResultsSummary";
import { ResultsFilters } from "@/components/features/results/ResultsFilters";
import { ResultsTable } from "@/components/features/results/ResultsTable";
import type { StaffGradingItem, ModuleItem, PublishFilter } from "@/types/results";

export default function StaffResultsPage() {
  const [items, setItems] = useState<StaffGradingItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("ALL");
  const [gradingSubmission, setGradingSubmission] = useState<StaffGradingItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

      const res = await fetch(`/api/results?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setItems(
          json.data.map((item: StaffGradingItem) => ({
            ...item,
            id: item.submissionId,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch grading items:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedModule, publishFilter]);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      showErrorAlert(message);
    } finally {
      setTogglingId(null);
    }
  };

  const totalSubmissions = items.length;
  const gradedCount = items.filter((i) => i.grade !== null).length;
  const publishedCount = items.filter((i) => i.isPublished).length;
  const withheldCount = gradedCount - publishedCount;

  return (
    <div className="flex flex-col gap-6 w-full">
      <ResultsHeader isLoading={isLoading} onRefresh={fetchGradingList} />
      <ResultsSummary
        totalSubmissions={totalSubmissions}
        gradedCount={gradedCount}
        publishedCount={publishedCount}
        withheldCount={withheldCount}
      />
      <ResultsFilters
        search={search}
        onSearchChange={setSearch}
        selectedModule={selectedModule}
        onModuleChange={setSelectedModule}
        publishFilter={publishFilter}
        onPublishFilterChange={setPublishFilter}
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
