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
