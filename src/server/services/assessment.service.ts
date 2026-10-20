import {
  findAssessmentsWithStats,
  createAssessmentRecord,
  getAssessmentModules,
} from "@/server/repositories/assessment.repository";
import { AssessmentFilterParams } from "@/server/types/assessment";
import { CreateAssessmentInput } from "@/lib/validations/assessment";

export async function listAssessments(filters: AssessmentFilterParams) {
  const assessments = await findAssessmentsWithStats(filters);

  // Group summary metrics
  const totalAssessments = assessments.length;
  const totalSubmissions = assessments.reduce(
    (acc, curr) => acc + curr.stats.totalSubmissions,
    0
  );
  const totalLateSubmissions = assessments.reduce(
    (acc, curr) => acc + curr.stats.lateSubmissionsCount,
    0
  );

  return {
    assessments,
    summary: {
      totalAssessments,
      totalSubmissions,
      totalLateSubmissions,
    },
  };
}

export async function createAssessment(data: CreateAssessmentInput) {
  return createAssessmentRecord(data);
}

export async function listAssessmentReferenceModules() {
  return getAssessmentModules();
}
