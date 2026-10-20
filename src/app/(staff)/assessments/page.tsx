"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/ui/modals/Modal";
import Pagination from "@/components/ui/pagination/Pagination";
import { CreateAssessmentForm } from "@/features/assessments/CreateAssessmentForm";
import { SubmissionInspectorModal } from "@/features/assessments/SubmissionInspectorModal";
import { AssessmentsHeader } from "@/components/features/assessments/AssessmentsHeader";
import { AssessmentsSummary } from "@/components/features/assessments/AssessmentsSummary";
import { AssessmentsFilters } from "@/components/features/assessments/AssessmentsFilters";
import { AssessmentsTable } from "@/components/features/assessments/AssessmentsTable";
import type { AssessmentItem, AssessmentSummary, ModuleData } from "@/types/assessments";
import type { PaginationMeta } from "@/types/pagination";

const PAGE_SIZE = 5;

export default function StaffAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [summary, setSummary] = useState<AssessmentSummary>({
    totalAssessments: 0,
    totalSubmissions: 0,
    totalLateSubmissions: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [inspectedAssessment, setInspectedAssessment] = useState<AssessmentItem | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch("/api/modules");
      const data = await res.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch modules", err);
    }
  }, []);

  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedModuleId && selectedModuleId !== "ALL") {
        params.set("moduleId", selectedModuleId);
      }
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));

      const res = await fetch(`/api/assessments?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setAssessments(data.data.assessments);
        setSummary(data.data.summary);
        setPagination(data.data.pagination || null);
      }
    } catch (err) {
      console.error("Failed to load assessments", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedModuleId, page]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <AssessmentsHeader
        onRefresh={() => fetchAssessments()}
        onCreate={() => setIsCreateModalOpen(true)}
      />
      <AssessmentsSummary summary={summary} />
      <AssessmentsFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        selectedModuleId={selectedModuleId}
        onModuleChange={(value) => {
          setSelectedModuleId(value);
          setPage(1);
        }}
        modules={modules}
      />
      <AssessmentsTable
        assessments={assessments}
        isLoading={isLoading}
        onInspect={setInspectedAssessment}
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assessment"
      >
        <CreateAssessmentForm
          modules={modules}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchAssessments();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

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
    </div>
  );
}
