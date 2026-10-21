import {
  saveOrUpdateGrade,
  setPublishStatus,
  findStaffResultPage,
  findStaffResultSummary,
  emptyStudentMarksheetStats,
  findStudentMarksheetRows,
  findStudentMarksheetStats,
} from "@/server/repositories/result.repository";
import { SaveGradeInput, TogglePublishInput } from "@/lib/validations/result";
import { connection } from "next/server";
import {
  StaffResultFilterParams,
  StaffResultListResult,
  StaffResultPublishQuery,
  StaffResultPublishStatus,
  StaffResultSummary,
  StudentMarksheetListResult,
  StudentMarksheetStats,
} from "@/server/types/result";
import { resolveStudentId } from "@/server/services/student.service";

export async function recordAssessmentGrade(input: SaveGradeInput) {
  return await saveOrUpdateGrade(input);
}

export async function toggleResultPublication(input: TogglePublishInput) {
  return await setPublishStatus(input);
}

const PUBLISH_STATUSES: StaffResultPublishStatus[] = [
  "ALL",
  "PUBLISHED",
  "WITHHELD",
  "UNGRADED",
];

function normalizePublishStatus(
  status?: string
): StaffResultPublishStatus {
  if (!status) return "ALL";

  return (
    PUBLISH_STATUSES.find((option) => option === status.toUpperCase()) || "ALL"
  );
}

export async function getStaffResults(
  query: StaffResultPublishQuery
): Promise<StaffResultListResult> {
  // Grades and publication flags change at any time, so never prerender this.
  await connection();

  const filters: StaffResultFilterParams = {
    search: query.search,
    moduleId: query.moduleId,
    publishStatus: normalizePublishStatus(query.publishStatus),
    page: query.page,
    pageSize: query.pageSize,
  };

  return await findStaffResultPage(filters);
}

export async function getStaffResultSummary(): Promise<StaffResultSummary> {
  // The ledger counters describe every submission, not the current filter.
  await connection();

  return await findStaffResultSummary();
}

export const emptyStudentMarksheetRows: StudentMarksheetListResult = {
  student: null,
  marksheet: [],
};

export async function getStudentMarksheet(
  studentId?: string | null
): Promise<StudentMarksheetListResult> {
  // The transcript belongs to whichever student the portal is impersonating.
  await connection();

  const resolvedId = await resolveStudentId(studentId);

  if (!resolvedId) {
    return emptyStudentMarksheetRows;
  }

  return await findStudentMarksheetRows(resolvedId);
}

export async function getStudentMarksheetStats(
  studentId?: string | null
): Promise<StudentMarksheetStats> {
  // Published averages follow every Registry action, not the rendered rows.
  await connection();

  const resolvedId = await resolveStudentId(studentId);

  if (!resolvedId) {
    return emptyStudentMarksheetStats;
  }

  return await findStudentMarksheetStats(resolvedId);
}
