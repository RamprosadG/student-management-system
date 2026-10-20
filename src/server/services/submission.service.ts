import {
  findAssessmentsForStudent,
  saveStudentSubmission,
} from "@/server/repositories/submission.repository";
import { CreateSubmissionInput } from "@/lib/validations/submission";

export async function getStudentAssessments(
  studentId: string,
  search?: string
) {
  return await findAssessmentsForStudent(studentId, search);
}

export async function submitAssessmentWork(
  input: CreateSubmissionInput,
  storageKey: string
) {
  return await saveStudentSubmission(input, storageKey);
}
