import {
  findStaffDashboardData,
  findStudentDashboardData,
} from "@/server/repositories/dashboard.repository";
import {
  DashboardMetrics,
  StudentDashboardMetrics,
} from "@/server/types/dashboard";

export async function getStaffDashboardMetrics(): Promise<DashboardMetrics> {
  return await findStaffDashboardData();
}

export async function getStudentDashboardMetrics(
  studentId: string
): Promise<StudentDashboardMetrics> {
  return await findStudentDashboardData(studentId);
}
