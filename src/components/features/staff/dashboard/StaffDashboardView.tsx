import { DashboardHeader } from "./DashboardHeader";
import { DashboardKpis } from "./DashboardKpis";
import { StaffOverdueAccountsSection } from "./StaffOverdueAccountsSection";
import { RecentSubmissionsPanel } from "./RecentSubmissionsPanel";
import { UpcomingDeadlinesPanel } from "./UpcomingDeadlinesPanel";
import type { StaffDashboardData } from "@/types/dashboard";

interface StaffDashboardViewProps {
  data: StaffDashboardData;
  isLoading?: boolean;
}

export function StaffDashboardView({ data, isLoading = false }: StaffDashboardViewProps) {
  return (
    <>
      <DashboardHeader isLoading={isLoading} />
      <DashboardKpis kpis={data.kpis} />
      <StaffOverdueAccountsSection students={data.priorityOverdueStudents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSubmissionsPanel submissions={data.recentSubmissions} />
        <UpcomingDeadlinesPanel deadlines={data.upcomingDeadlines} />
      </div>
    </>
  );
}
