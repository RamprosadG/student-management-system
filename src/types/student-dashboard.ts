export interface UpcomingDeadlineItem {
  id: string;
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
}

export interface PaymentRecordItem {
  id: string;
  amount: number;
  paidAt: string;
  referenceNumber: string;
}

export interface StudentDashboardStudent {
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

export interface StudentFinancialSummary {
  amountDue: number;
  totalPaid: number;
  balance: number;
  dueDate: string | null;
  status: "PAID" | "PARTIAL" | "OVERDUE";
  daysOverdue: number;
  recentPayments: PaymentRecordItem[];
}

export interface StudentAcademicProgress {
  totalAssigned: number;
  submittedCount: number;
  pendingCount: number;
  publishedCount: number;
  averageGrade: number | null;
  overallClassification: string | null;
}

export interface StudentDashboardData {
  student: StudentDashboardStudent | null;
  financialSummary: StudentFinancialSummary;
  academicProgress: StudentAcademicProgress;
  upcomingDeadlines: UpcomingDeadlineItem[];
}
