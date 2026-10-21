"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Modal from "@/components/ui/modals/Modal";
import { SubmitAssessmentModal } from "@/features/assessments/SubmitAssessmentModal";
import { SubmissionHistoryModal } from "@/features/assessments/SubmissionHistoryModal";
import { StudentAssessmentsFilters } from "./StudentAssessmentsFilters";
import { StudentAssessmentsTable } from "./StudentAssessmentsTable";
import type {
  StudentAssessmentsFilters as FilterState,
  StudentAssessmentItem,
  StudentInfo,
} from "@/types/student-assessments";

interface StudentAssessmentsSectionProps {
  student: StudentInfo | null;
  assessments: StudentAssessmentItem[];
  filters: FilterState;
}

export function StudentAssessmentsSection({
  student,
  assessments,
  filters,
}: StudentAssessmentsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [selectedAssessmentToSubmit, setSelectedAssessmentToSubmit] =
    useState<StudentAssessmentItem | null>(null);
  const [historyAssessment, setHistoryAssessment] =
    useState<StudentAssessmentItem | null>(null);

  // Filter state lives in the URL, so the list itself can be rendered on the server.
  const navigate = (changes: Partial<FilterState>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.status && next.status !== "ALL") params.set("status", next.status);

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startTransition(() => router.refresh());

  return (
    <>
      <StudentAssessmentsFilters
        search={filters.search}
        onSearchChange={(value) => navigate({ search: value })}
        statusFilter={filters.status}
        onStatusChange={(value) => navigate({ status: value })}
      />
      <StudentAssessmentsTable
        assessments={assessments}
        isLoading={isPending}
        emptyMessage={
          filters.search || filters.status !== "ALL"
            ? "No assessments match the current filters."
            : "No assessments currently assigned to your enrolled programme."
        }
        onSubmit={setSelectedAssessmentToSubmit}
        onViewHistory={setHistoryAssessment}
      />

      <Modal
        isOpen={Boolean(selectedAssessmentToSubmit)}
        onClose={() => setSelectedAssessmentToSubmit(null)}
        title={
          selectedAssessmentToSubmit?.submission
            ? `Resubmit Work: ${selectedAssessmentToSubmit.title}`
            : `Submit Assessment: ${selectedAssessmentToSubmit?.title || ""}`
        }
      >
        {selectedAssessmentToSubmit && student && (
          <SubmitAssessmentModal
            assessment={selectedAssessmentToSubmit}
            studentId={student.id}
            studentName={student.fullName}
            onSuccess={() => {
              setSelectedAssessmentToSubmit(null);
              refresh();
            }}
            onClose={() => setSelectedAssessmentToSubmit(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(historyAssessment)}
        onClose={() => setHistoryAssessment(null)}
        title="Submission Version Audit History"
      >
        {historyAssessment && historyAssessment.submission && (
          <SubmissionHistoryModal
            assessment={{
              title: historyAssessment.title,
              deadline: historyAssessment.deadline,
              module: {
                code: historyAssessment.module.code,
                title: historyAssessment.module.title,
              },
            }}
            versions={historyAssessment.submission.versions}
            onClose={() => setHistoryAssessment(null)}
          />
        )}
      </Modal>
    </>
  );
}
