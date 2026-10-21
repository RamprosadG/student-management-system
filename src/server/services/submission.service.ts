import { saveStudentSubmission } from "@/server/repositories/submission.repository";
import { CreateSubmissionInput } from "@/lib/validations/submission";

export async function submitAssessmentWork(
  input: CreateSubmissionInput,
  storageKey: string
) {
  return await saveStudentSubmission(input, storageKey);
}
