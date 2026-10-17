import {
  findStaffDashboardData,
  findStudentDashboardData,
  DashboardMetrics,
  StudentDashboardMetrics,
} from "@/server/repositories/dashboard.repository";

export async function getStaffDashboardMetrics(): Promise<DashboardMetrics> {
  return await findStaffDashboardData();
}

export async function getStudentDashboardMetrics(
  studentId: string
): Promise<StudentDashboardMetrics> {
  return await findStudentDashboardData(studentId);
}
