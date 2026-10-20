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
