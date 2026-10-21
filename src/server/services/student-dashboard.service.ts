import { connection } from "next/server";
import {
  emptyStudentDashboardMetrics,
  findStudentDashboardData,
} from "@/server/repositories/student-dashboard.repository";
import { resolveStudentId } from "@/server/services/student.service";
import { StudentDashboardMetrics } from "@/server/types/student-dashboard";

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
