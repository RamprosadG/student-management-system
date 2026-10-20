import {
  findAssessmentsWithStats,
  createAssessmentRecord,
  getAssessmentModules,
} from "@/server/repositories/assessment.repository";
import { AssessmentFilterParams } from "@/server/types/assessment";
import { CreateAssessmentInput } from "@/lib/validations/assessment";
import {
  DEFAULT_PAGE_SIZE,
  buildPaginationMeta,
} from "@/server/types/pagination";

export async function listAssessments(filters: AssessmentFilterParams) {
  const allAssessments = await findAssessmentsWithStats(filters);

  // Group summary metrics over the entire filtered set
  const totalAssessments = allAssessments.length;
  const totalSubmissions = allAssessments.reduce(
    (acc, curr) => acc + curr.stats.totalSubmissions,
    0
  );
  const totalLateSubmissions = allAssessments.reduce(
    (acc, curr) => acc + curr.stats.lateSubmissionsCount,
    0
  );

  const pageSize =
    filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const pagination = buildPaginationMeta(
    filters.page ?? 1,
    pageSize,
    totalAssessments
  );
  const start = (pagination.page - 1) * pageSize;
  const assessments = allAssessments.slice(start, start + pageSize);

  return {
    assessments,
    summary: {
      totalAssessments,
      totalSubmissions,
      totalLateSubmissions,
    },
    pagination,
  };
}

export async function createAssessment(data: CreateAssessmentInput) {
  return createAssessmentRecord(data);
}

export async function listAssessmentReferenceModules() {
  return getAssessmentModules();
}
