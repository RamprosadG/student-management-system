import type { Classification } from "@/lib/validations/result";
import type { PaginationMeta } from "./pagination";

export type StaffResultPublishStatus = "ALL" | "PUBLISHED" | "WITHHELD" | "UNGRADED";

export interface StaffResultFilterParams {
  search?: string;
  moduleId?: string;
  publishStatus?: StaffResultPublishStatus;
  page: number;
  pageSize: number;
}

export interface StaffResultRow {
  id: string;
  submissionId: string;
  studentId: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  assessmentId: string;
  assessmentTitle: string;
  deadline: string;
  moduleCode: string;
  moduleTitle: string;
  programmeCode: string;
  programmeName: string;
  fileName: string;
  fileSize: number;
  fileUrl: string | null;
  submittedAt: string;
  versionCount: number;
  latestVersionNumber: number;
  isLate: boolean;
  lateDurationText: string | null;
  resultId: string | null;
  grade: number | null;
  classification: Classification | null;
  isPublished: boolean;
  gradedAt: string | null;
}

export interface StaffResultPublishQuery {
  search?: string;
  moduleId?: string;
  publishStatus?: string;
  page: number;
  pageSize: number;
}

export interface StaffResultListResult {
  items: StaffResultRow[];
  pagination: PaginationMeta;
}

export interface StaffResultSummary {
  totalSubmissions: number;
  gradedCount: number;
  publishedCount: number;
  withheldCount: number;
}

export interface StudentMarksheetStudent {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  programme: {
    id: string;
    code: string;
    name: string;
  };
  academicYear: {
    name: string;
  };
}

export interface StudentMarksheetItem {
  id: string;
  assessmentTitle: string;
  moduleCode: string;
  moduleTitle: string;
  deadline: string;
  submission: {
    id: string;
    fileName: string;
    submittedAt: string;
    isLate: boolean;
    versionNumber: number;
  } | null;
  result: {
    id: string;
    grade: number;
    classification: Classification;
    gradedAt: string;
  } | null;
  hasSubmission: boolean;
  statusText: string;
}

export interface StudentMarksheetListResult {
  student: StudentMarksheetStudent | null;
  marksheet: StudentMarksheetItem[];
}

export interface StudentMarksheetStats {
  totalAssessments: number;
  publishedResultsCount: number;
  withheldOrPendingCount: number;
  averageGrade: number | null;
  overallClassification: Classification | null;
}
