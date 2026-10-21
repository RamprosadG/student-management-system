import { connection } from "next/server";
import {
  findStaffAssessmentPage,
  findStaffAssessmentSummary,
} from "@/server/repositories/staff-assessment.repository";
import {
  StaffAssessmentFilterParams,
  StaffAssessmentListResult,
  StaffAssessmentSummary,
} from "@/server/types/staff-assessment";

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
