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

export type StudentAssessmentStatusFilter =
  | "ALL"
  | "PENDING"
  | "SUBMITTED"
  | "LATE";

export interface StudentAssessmentFilterParams {
  studentId: string;
  search?: string;
  status?: StudentAssessmentStatusFilter;
}

/**
 * What a caller asks for: the student may still be unresolved because roles are
 * simulated client-side and nobody has been impersonated yet.
 */
export interface StudentAssessmentQuery {
  studentId?: string | null;
  search?: string;
  status?: string;
}

export interface StudentAssessmentProgramme {
  id: string;
  code: string;
  name: string;
}

export interface StudentAssessmentModule {
  id: string;
  code: string;
  title: string;
  programme: StudentAssessmentProgramme;
}

export interface StudentAssessmentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  submittedAt: string;
  isLate: boolean;
}

export interface StudentAssessmentResult {
  id: string;
  grade: number;
  isPublished: boolean;
}

export interface StudentAssessmentSubmission {
  id: string;
  createdAt: string;
  updatedAt: string;
  latestVersionNumber: number;
  totalVersions: number;
  fileName: string;
  fileSize: number;
  storageKey: string;
  mimeType: string;
  submittedAt: string;
  isLate: boolean;
  lateDurationText: string | null;
  versions: StudentAssessmentVersion[];
  result?: StudentAssessmentResult | null;
}

export interface StudentAssessmentRow {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  createdAt: string;
  module: StudentAssessmentModule;
  submission: StudentAssessmentSubmission | null;
}

export interface StudentAssessmentAcademicYear {
  id: string;
  name: string;
}

export interface StudentAssessmentProfile {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  programme: StudentAssessmentProgramme;
  academicYear: StudentAssessmentAcademicYear;
}

export interface StudentAssessmentListResult {
  student: StudentAssessmentProfile | null;
  assessments: StudentAssessmentRow[];
}

export interface StudentAssessmentSummary {
  totalAssessments: number;
  submittedCount: number;
  pendingCount: number;
  overdueCount: number;
}
