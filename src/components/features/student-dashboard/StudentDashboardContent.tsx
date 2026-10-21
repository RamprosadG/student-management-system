import { cookies } from "next/headers";
import { getStudentDashboardMetrics } from "@/server/services/dashboard.service";
import { STUDENT_SELECTION_COOKIE } from "@/lib/student-selection";
import type { StudentDashboardData } from "@/types/dashboard";
import { StudentDashboardView } from "./StudentDashboardView";

const emptyDashboardData: StudentDashboardData = {
  student: null,
  financialSummary: {
    amountDue: 0,
    totalPaid: 0,
    balance: 0,
    dueDate: null,
    status: "PAID",
    daysOverdue: 0,
    recentPayments: [],
  },
  academicProgress: {
    totalAssigned: 0,
    submittedCount: 0,
    pendingCount: 0,
    publishedCount: 0,
    averageGrade: null,
    overallClassification: null,
  },
  upcomingDeadlines: [],
};

export function StudentDashboardLoading() {
  return <StudentDashboardView data={emptyDashboardData} isLoading />;
}

export async function StudentDashboardContent() {
  const cookieStore = await cookies();
  const selectedStudentId = cookieStore.get(STUDENT_SELECTION_COOKIE)?.value;

  const metrics = await getStudentDashboardMetrics(selectedStudentId);

  const data: StudentDashboardData = {
    ...metrics,
    upcomingDeadlines: metrics.upcomingDeadlines.map((item) => ({
      ...item,
      id: item.assessmentId,
    })),
  };

  return <StudentDashboardView data={data} />;
}
