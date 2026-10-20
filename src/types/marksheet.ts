export type Classification = "Distinction" | "Merit" | "Pass" | "Fail";

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

export interface MarksheetResponse {
  student: StudentMarksheetStudent | null;
  marksheet: StudentMarksheetItem[];
  stats: StudentMarksheetStats;
}
