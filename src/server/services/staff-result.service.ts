import { connection } from "next/server";
import {
  findStaffResultPage,
  findStaffResultSummary,
} from "@/server/repositories/staff-result.repository";
import {
  StaffResultFilterParams,
  StaffResultListResult,
  StaffResultPublishQuery,
  StaffResultPublishStatus,
  StaffResultSummary,
} from "@/server/types/staff-result";

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
