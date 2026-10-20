import {
  findStaffGradingList,
  findStudentMarksheet,
  saveOrUpdateGrade,
  setPublishStatus,
} from "@/server/repositories/result.repository";
import { SaveGradeInput, TogglePublishInput } from "@/lib/validations/result";

export async function getStaffGradingSheet(params: {
  search?: string;
  moduleId?: string;
  publishStatus?: "ALL" | "PUBLISHED" | "WITHHELD" | "UNGRADED";
}) {
  return await findStaffGradingList(params);
}

export async function getStudentOfficialMarksheet(studentId: string) {
  return await findStudentMarksheet(studentId);
}

export async function recordAssessmentGrade(input: SaveGradeInput) {
  return await saveOrUpdateGrade(input);
}

export async function toggleResultPublication(input: TogglePublishInput) {
  return await setPublishStatus(input);
}
