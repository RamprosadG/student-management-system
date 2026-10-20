export interface DashboardMetrics {
  kpis: {
    totalStudents: number;
    enrolledStudents: number;
    totalOutstandingBalance: number;
    overdueAccountsCount: number;
    totalAssessments: number;
    pendingGradingCount: number;
  };
  priorityOverdueStudents: Array<{
    studentFeeId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    programmeCode: string;
    amountDue: number;
    totalPaid: number;
    balance: number;
    dueDate: string;
    daysOverdue: number;
  }>;
  recentSubmissions: Array<{
    submissionId: string;
    studentName: string;
    studentId: string;
    assessmentTitle: string;
    moduleCode: string;
    fileName: string;
    submittedAt: string;
    isLate: boolean;
    lateDurationText: string | null;
    versionNumber: number;
    grade: number | null;
    isPublished: boolean;
  }>;
  upcomingDeadlines: Array<{
    assessmentId: string;
    title: string;
    moduleCode: string;
    moduleTitle: string;
    programmeCode: string;
    deadline: string;
    isPastDeadline: boolean;
    submissionCount: number;
  }>;
}

export interface StudentDashboardMetrics {
  student: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    status: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
    academicYear: {
      name: string;
    };
  } | null;
  financialSummary: {
    amountDue: number;
    totalPaid: number;
    balance: number;
    dueDate: string | null;
    status: "PAID" | "PARTIAL" | "OVERDUE";
    daysOverdue: number;
    recentPayments: Array<{
      id: string;
      amount: number;
      paidAt: string;
      referenceNumber: string;
    }>;
  };
  academicProgress: {
    totalAssigned: number;
    submittedCount: number;
    pendingCount: number;
    publishedCount: number;
    averageGrade: number | null;
    overallClassification: string | null;
  };
  upcomingDeadlines: Array<{
    assessmentId: string;
    title: string;
    moduleCode: string;
    moduleTitle: string;
    deadline: string;
    isPastDeadline: boolean;
    submission: {
      id: string;
      versionNumber: number;
      submittedAt: string;
      isLate: boolean;
    } | null;
  }>;
}
