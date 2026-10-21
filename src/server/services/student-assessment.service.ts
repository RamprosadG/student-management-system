import { connection } from "next/server";
import {
  findStudentAssessmentList,
  findStudentAssessmentSummary,
} from "@/server/repositories/student-assessment.repository";
import { resolveStudentId } from "@/server/services/student.service";
import {
  StudentAssessmentListResult,
  StudentAssessmentQuery,
  StudentAssessmentStatusFilter,
  StudentAssessmentSummary,
} from "@/server/types/student-assessment";

const STATUS_FILTERS: StudentAssessmentStatusFilter[] = [
  "ALL",
  "PENDING",
  "SUBMITTED",
  "LATE",
];

export const emptyStudentAssessmentList: StudentAssessmentListResult = {
  student: null,
  assessments: [],
};

export const emptyStudentAssessmentSummary: StudentAssessmentSummary = {
  totalAssessments: 0,
  submittedCount: 0,
  pendingCount: 0,
  overdueCount: 0,
};

function normalizeStatus(
  status?: string
): StudentAssessmentStatusFilter | undefined {
  if (!status) return undefined;

  return STATUS_FILTERS.find((option) => option === status.toUpperCase());
}

export async function getStudentAssessments(
  query: StudentAssessmentQuery
): Promise<StudentAssessmentListResult> {
  // Past-deadline flags depend on the current time, so never prerender this.
  await connection();

  const studentId = await resolveStudentId(query.studentId);

  if (!studentId) {
    return emptyStudentAssessmentList;
  }

  return await findStudentAssessmentList({
    studentId,
    search: query.search,
    status: normalizeStatus(query.status),
  });
}

export async function getStudentAssessmentSummary(
  studentId?: string | null
): Promise<StudentAssessmentSummary> {
  // The overdue counter compares deadlines against the current time.
  await connection();

  const resolvedId = await resolveStudentId(studentId);

  if (!resolvedId) {
    return emptyStudentAssessmentSummary;
  }

  return await findStudentAssessmentSummary(resolvedId);
}
