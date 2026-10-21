export interface StaffDashboardKpis {
  totalStudents: number;
  enrolledStudents: number;
  totalOutstandingBalance: number;
  overdueAccountsCount: number;
  totalAssessments: number;
  pendingGradingCount: number;
}

export interface StaffPriorityOverdueStudent {
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

export interface StaffRecentSubmission {
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

export interface StaffUpcomingDeadline {
  assessmentId: string;
  title: string;
  moduleCode: string;
  moduleTitle: string;
  programmeCode: string;
  deadline: string;
  isPastDeadline: boolean;
  submissionCount: number;
}

export interface StaffDashboardMetrics {
  kpis: StaffDashboardKpis;
  priorityOverdueStudents: StaffPriorityOverdueStudent[];
  recentSubmissions: StaffRecentSubmission[];
  upcomingDeadlines: StaffUpcomingDeadline[];
}
