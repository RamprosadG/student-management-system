import { connection } from "next/server";
import {
  emptyStudentDashboardMetrics,
  findFirstEnrolledStudentId,
  findStudentDashboardData,
} from "@/server/repositories/student-dashboard.repository";
import { StudentDashboardMetrics } from "@/server/types/student-dashboard";

export async function resolveStudentDashboardId(
  studentId?: string | null
): Promise<string | null> {
  if (studentId) return studentId;
  return await findFirstEnrolledStudentId();
}

export async function getStudentDashboardMetrics(
  studentId?: string | null
): Promise<StudentDashboardMetrics> {
  // Overdue and deadline flags depend on the current time, so never prerender this.
  await connection();

  const resolvedId = await resolveStudentDashboardId(studentId);

  if (!resolvedId) {
    return emptyStudentDashboardMetrics;
  }

  return await findStudentDashboardData(resolvedId);
}
