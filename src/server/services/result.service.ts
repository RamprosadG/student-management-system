import {
  findStaffGradingList,
  findStudentMarksheet,
  saveOrUpdateGrade,
  setPublishStatus,
} from "@/server/repositories/result.repository";
import { SaveGradeInput, TogglePublishInput } from "@/lib/validations/result";
import {
  DEFAULT_PAGE_SIZE,
  buildPaginationMeta,
} from "@/server/types/pagination";

export async function getStaffGradingSheet(params: {
  search?: string;
  moduleId?: string;
  publishStatus?: "ALL" | "PUBLISHED" | "WITHHELD" | "UNGRADED";
  page?: number;
  pageSize?: number;
}) {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, ...filters } = params;
  const allItems = await findStaffGradingList(filters);

  // Summary metrics are computed over the entire filtered set, not just the page
  const totalSubmissions = allItems.length;
  const gradedCount = allItems.filter((i) => i.grade !== null).length;
  const publishedCount = allItems.filter((i) => i.isPublished).length;
  const withheldCount = gradedCount - publishedCount;

  const pagination = buildPaginationMeta(page, pageSize, totalSubmissions);
  const start = (pagination.page - 1) * pageSize;
  const items = allItems.slice(start, start + pageSize);

  return {
    items,
    summary: {
      totalSubmissions,
      gradedCount,
      publishedCount,
      withheldCount,
    },
    pagination,
  };
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
