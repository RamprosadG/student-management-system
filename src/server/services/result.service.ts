import {
  saveOrUpdateGrade,
  setPublishStatus,
} from "@/server/repositories/result.repository";
import { SaveGradeInput, TogglePublishInput } from "@/lib/validations/result";

export async function recordAssessmentGrade(input: SaveGradeInput) {
  return await saveOrUpdateGrade(input);
}

export async function toggleResultPublication(input: TogglePublishInput) {
  return await setPublishStatus(input);
}
