import { getStaffDashboardMetrics } from "@/server/services/dashboard.service";
import type { StaffDashboardData } from "@/types/dashboard";
import { StaffDashboardView } from "./StaffDashboardView";

const emptyDashboardData: StaffDashboardData = {
  kpis: {
    totalStudents: 0,
    enrolledStudents: 0,
    totalOutstandingBalance: 0,
    overdueAccountsCount: 0,
    totalAssessments: 0,
    pendingGradingCount: 0,
  },
  priorityOverdueStudents: [],
  recentSubmissions: [],
  upcomingDeadlines: [],
};

export function StaffDashboardLoading() {
  return <StaffDashboardView data={emptyDashboardData} isLoading />;
}

export async function StaffDashboardContent() {
  const metrics = await getStaffDashboardMetrics();

  const data: StaffDashboardData = {
    kpis: metrics.kpis,
    priorityOverdueStudents: metrics.priorityOverdueStudents.map((item) => ({
      ...item,
      id: item.studentFeeId,
    })),
    recentSubmissions: metrics.recentSubmissions.map((item) => ({
      ...item,
      id: item.submissionId,
    })),
    upcomingDeadlines: metrics.upcomingDeadlines.map((item) => ({
      ...item,
      id: item.assessmentId,
    })),
  };

  return <StaffDashboardView data={data} />;
}
