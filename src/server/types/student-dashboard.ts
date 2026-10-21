export interface StudentDashboardProfile {
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
}

export interface StudentDashboardPayment {
  id: string;
  amount: number;
  paidAt: string;
  referenceNumber: string;
}

export interface StudentFinancialSummary {
  amountDue: number;
  totalPaid: number;
  balance: number;
  dueDate: string | null;
  status: "PAID" | "PARTIAL" | "OVERDUE";
  daysOverdue: number;
  recentPayments: StudentDashboardPayment[];
}

export interface StudentAcademicProgress {
  totalAssigned: number;
  submittedCount: number;
  pendingCount: number;
  publishedCount: number;
  averageGrade: number | null;
  overallClassification: string | null;
}

export interface StudentDeadlineSubmission {
  id: string;
  versionNumber: number;
  submittedAt: string;
  isLate: boolean;
}

export interface StudentDeadlineItem {
  assessmentId: string;
  title: string;
  moduleCode: string;
  moduleTitle: string;
  deadline: string;
  isPastDeadline: boolean;
  submission: StudentDeadlineSubmission | null;
}

export interface StudentDashboardMetrics {
  student: StudentDashboardProfile | null;
  financialSummary: StudentFinancialSummary;
  academicProgress: StudentAcademicProgress;
  upcomingDeadlines: StudentDeadlineItem[];
}
