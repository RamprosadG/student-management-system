

export interface PriorityOverdueStudent {
  id: string;
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
}

export interface RecentSubmission {
  id: string;
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
}

export interface UpcomingDeadline {
  id: string;
  assessmentId: string;
  title: string;
  moduleCode: string;
  moduleTitle: string;
  programmeCode: string;
  deadline: string;
  isPastDeadline: boolean;
  submissionCount: number;
}

export interface StaffDashboardKpis {
  totalStudents: number;
  enrolledStudents: number;
  totalOutstandingBalance: number;
  overdueAccountsCount: number;
  totalAssessments: number;
  pendingGradingCount: number;
}

export interface StaffDashboardData {
  kpis: StaffDashboardKpis;
  priorityOverdueStudents: PriorityOverdueStudent[];
  recentSubmissions: RecentSubmission[];
  upcomingDeadlines: UpcomingDeadline[];
}

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
