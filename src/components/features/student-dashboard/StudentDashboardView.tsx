import { StudentDashboardHero } from "./StudentDashboardHero";
import { StudentDashboardKpis } from "./StudentDashboardKpis";
import { StudentDeadlinesPanel } from "./StudentDeadlinesPanel";
import { StudentTuitionPanel } from "./StudentTuitionPanel";
import type { StudentDashboardData } from "@/types/student-dashboard";

interface StudentDashboardViewProps {
  data: StudentDashboardData;
  isLoading?: boolean;
}

export function StudentDashboardView({
  data,
  isLoading = false,
}: StudentDashboardViewProps) {
  return (
    <>
      <StudentDashboardHero student={data.student} isLoading={isLoading} />
      <StudentDashboardKpis finance={data.financialSummary} academic={data.academicProgress} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudentDeadlinesPanel deadlines={data.upcomingDeadlines} />
        <StudentTuitionPanel finance={data.financialSummary} />
      </div>
    </>
  );
}
