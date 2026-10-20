import { Classification } from "@/lib/validations/result";

export interface StaffGradingItem {
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

export interface StudentMarksheetItem {
  id: string; // assessmentId
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
  } | null; // null if not graded OR withheld
  hasSubmission: boolean;
  statusText: string;
}
