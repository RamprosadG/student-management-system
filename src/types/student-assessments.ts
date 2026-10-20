import type { SubmissionVersionItem } from "@/features/assessments/SubmissionHistoryModal";

export interface StudentAssessmentItem {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  createdAt: string;
  module: {
    id: string;
    code: string;
    title: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
  };
  submission: {
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
    versions: SubmissionVersionItem[];
    result?: {
      id: string;
      grade: number;
      isPublished: boolean;
    } | null;
  } | null;
}

export interface StudentInfo {
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
    id: string;
    name: string;
  };
}
