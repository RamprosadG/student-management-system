import {
  createAssessmentRecord,
  findStaffAssessmentPage,
  findStaffAssessmentSummary,
  findStudentAssessmentList,
  findStudentAssessmentSummary,
} from "@/server/repositories/assessment.repository";
import { CreateAssessmentInput } from "@/lib/validations/assessment";
import { connection } from "next/server";
import {
  StaffAssessmentFilterParams,
  StaffAssessmentListResult,
  StaffAssessmentSummary,
  StudentAssessmentListResult,
  StudentAssessmentQuery,
  StudentAssessmentStatusFilter,
  StudentAssessmentSummary,
} from "@/server/types/assessment";
import { resolveStudentId } from "@/server/services/student.service";

export async function createAssessment(data: CreateAssessmentInput) {
  return createAssessmentRecord(data);
}

export async function getStaffAssessments(
  filters: StaffAssessmentFilterParams
): Promise<StaffAssessmentListResult> {
  // Past-deadline flags depend on the current time, so never prerender this.
  await connection();

  return await findStaffAssessmentPage(filters);
}

export async function getStaffAssessmentSummary(): Promise<StaffAssessmentSummary> {
  // The late-submission counter compares upload times against deadlines.
  await connection();

  return await findStaffAssessmentSummary();
}

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
