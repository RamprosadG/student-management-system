import type { PaginationMeta } from "./pagination";

export interface StaffAssessmentFilterParams {
  search?: string;
  moduleId?: string;
  programmeId?: string;
  page: number;
  pageSize: number;
}

export interface StaffAssessmentProgramme {
  id: string;
  code: string;
  name: string;
}

export interface StaffAssessmentModule {
  id: string;
  code: string;
  title: string;
  programme: StaffAssessmentProgramme;
}

export interface StaffAssessmentSubmissionResult {
  id: string;
  grade: number;
  isPublished: boolean;
}

export interface StaffAssessmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  versionCount: number;
  latestVersionNumber: number;
  fileName: string;
  fileSize: number;
  fileUrl: string | null;
  submittedAt: string;
  isLate: boolean;
  lateDurationText: string | null;
  result: StaffAssessmentSubmissionResult | null;
}

export interface StaffAssessmentStats {
  totalSubmissions: number;
  onTimeSubmissionsCount: number;
  lateSubmissionsCount: number;
}

export interface StaffAssessmentRow {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  createdAt: string;
  module: StaffAssessmentModule;
  stats: StaffAssessmentStats;
  submissions: StaffAssessmentSubmission[];
}

export interface StaffAssessmentListResult {
  assessments: StaffAssessmentRow[];
  pagination: PaginationMeta;
}

export interface StaffAssessmentSummary {
  totalAssessments: number;
  totalSubmissions: number;
  totalLateSubmissions: number;
}
