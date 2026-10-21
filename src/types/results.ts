import type { PaginationMeta } from "@/types/pagination";

export type Classification = "Distinction" | "Merit" | "Pass" | "Fail";
export type PublishFilter = "ALL" | "PUBLISHED" | "WITHHELD" | "UNGRADED";

export interface StaffGradingItem {
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

export interface ModuleItem {
  id: string;
  code: string;
  title: string;
  programme?: { code: string; name: string };
}

export interface StaffGradingSummary {
  totalSubmissions: number;
  gradedCount: number;
  publishedCount: number;
  withheldCount: number;
}

export interface StaffResultsFilters {
  search: string;
  moduleId: string;
  publishFilter: PublishFilter;
  page: number;
}

export interface StaffResultsData {
  items: StaffGradingItem[];
  summary: StaffGradingSummary;
  modules: ModuleItem[];
  pagination: PaginationMeta | null;
  filters: StaffResultsFilters;
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

export interface StudentMarksheetStats {
  totalAssessments: number;
  publishedResultsCount: number;
  withheldOrPendingCount: number;
  averageGrade: number | null;
  overallClassification: Classification | null;
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

export interface StudentMarksheetData {
  student: StudentMarksheetStudent | null;
  marksheet: StudentMarksheetItem[];
  stats: StudentMarksheetStats;
}
