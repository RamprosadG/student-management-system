import { createAssessmentRecord } from "@/server/repositories/assessment.repository";
import { CreateAssessmentInput } from "@/lib/validations/assessment";

export async function createAssessment(data: CreateAssessmentInput) {
  return createAssessmentRecord(data);
}
