import type { SubmissionItem } from "@/features/assessments/SubmissionInspectorModal";
import type { PaginationMeta } from "@/types/pagination";

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

export interface StaffAssessmentsFilters {
  search: string;
  moduleId: string;
  page: number;
}

export interface StaffAssessmentsData {
  assessments: AssessmentItem[];
  summary: AssessmentSummary;
  modules: ModuleData[];
  pagination: PaginationMeta | null;
  filters: StaffAssessmentsFilters;
}
