import { connection } from "next/server";
import {
  findStaffDashboardData,
  emptyStudentDashboardMetrics,
  findStudentDashboardData,
} from "@/server/repositories/dashboard.repository";
import {
  StaffDashboardMetrics,
  StudentDashboardMetrics,
} from "@/server/types/dashboard";
import { resolveStudentId } from "@/server/services/student.service";

export async function getStaffDashboardMetrics(): Promise<StaffDashboardMetrics> {
  // Dashboard metrics are live aggregates, so they must never be prerendered.
  await connection();
  return await findStaffDashboardData();
}

export async function getStudentDashboardMetrics(
  studentId?: string | null
): Promise<StudentDashboardMetrics> {
  // Overdue and deadline flags depend on the current time, so never prerender this.
  await connection();

  const resolvedId = await resolveStudentId(studentId);

  if (!resolvedId) {
    return emptyStudentDashboardMetrics;
  }

  return await findStudentDashboardData(resolvedId);
}
