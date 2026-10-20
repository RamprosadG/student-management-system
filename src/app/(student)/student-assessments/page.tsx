"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/ui/modals/Modal";
import { useRole } from "@/components/shared/RoleContext";
import { SubmitAssessmentModal } from "@/features/assessments/SubmitAssessmentModal";
import { SubmissionHistoryModal } from "@/features/assessments/SubmissionHistoryModal";
import { StudentAssessmentsHeader } from "@/components/features/student-assessments/StudentAssessmentsHeader";
import { StudentAssessmentsKpis } from "@/components/features/student-assessments/StudentAssessmentsKpis";
import { StudentAssessmentsFilters } from "@/components/features/student-assessments/StudentAssessmentsFilters";
import { StudentAssessmentsTable } from "@/components/features/student-assessments/StudentAssessmentsTable";
import type { StudentAssessmentItem, StudentInfo } from "@/types/student-assessments";

export default function StudentAssessmentsPage() {
  const { selectedStudentId } = useRole();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [assessments, setAssessments] = useState<StudentAssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAssessmentToSubmit, setSelectedAssessmentToSubmit] =
    useState<StudentAssessmentItem | null>(null);
  const [historyAssessment, setHistoryAssessment] =
    useState<StudentAssessmentItem | null>(null);

  const fetchStudentAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStudentId) {
        params.append("studentId", selectedStudentId);
      }
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`/api/submissions?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setStudentInfo(json.data.student || null);
        setAssessments(json.data.assessments || []);
      }
    } catch (err) {
      console.error("Failed to fetch student assessments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId, search]);

  useEffect(() => {
    fetchStudentAssessments();
  }, [fetchStudentAssessments]);

  const totalAssessments = assessments.length;
  const submittedCount = assessments.filter((a) => a.submission !== null).length;
  const pendingCount = totalAssessments - submittedCount;
  const overdueCount = assessments.filter(
    (a) => a.isPastDeadline && a.submission === null
  ).length;

  const filteredAssessments = assessments.filter((item) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return item.submission === null;
    if (statusFilter === "SUBMITTED") return item.submission !== null;
    if (statusFilter === "LATE") {
      return item.submission?.isLate || (item.isPastDeadline && !item.submission);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <StudentAssessmentsHeader
        studentInfo={studentInfo}
        isLoading={isLoading}
        onRefresh={fetchStudentAssessments}
      />
      <StudentAssessmentsKpis
        totalAssessments={totalAssessments}
        submittedCount={submittedCount}
        pendingCount={pendingCount}
        overdueCount={overdueCount}
      />
      <StudentAssessmentsFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <StudentAssessmentsTable
        assessments={filteredAssessments}
        isLoading={isLoading}
        emptyMessage={
          search || statusFilter !== "ALL"
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
        {selectedAssessmentToSubmit && studentInfo && (
          <SubmitAssessmentModal
            assessment={selectedAssessmentToSubmit}
            studentId={studentInfo.id}
            studentName={studentInfo.fullName}
            onSuccess={() => {
              setSelectedAssessmentToSubmit(null);
              fetchStudentAssessments();
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
    </div>
  );
}
