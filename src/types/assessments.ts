import type { SubmissionItem } from "@/features/assessments/SubmissionInspectorModal";

export interface ModuleData {
  id: string;
  code: string;
  title: string;
  programme: {
    id: string;
    code: string;
    name: string;
  };
}

export interface AssessmentItem {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  createdAt: string;
  module: ModuleData;
  stats: {
    totalSubmissions: number;
    onTimeSubmissionsCount: number;
    lateSubmissionsCount: number;
  };
  submissions: SubmissionItem[];
}

export interface AssessmentSummary {
  totalAssessments: number;
  totalSubmissions: number;
  totalLateSubmissions: number;
}
