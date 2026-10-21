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
