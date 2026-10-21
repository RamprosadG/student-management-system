import { connection } from "next/server";
import {
  getStaffAssessmentSummary,
  getStaffAssessments,
} from "@/server/services/staff-assessment.service";
import { listModules } from "@/server/services/module.service";
import type {
  StaffAssessmentsData,
  StaffAssessmentsFilters,
} from "@/types/staff-assessments";
import { StaffAssessmentsView } from "./StaffAssessmentsView";

const PAGE_SIZE = 5;

const emptyData: StaffAssessmentsData = {
  assessments: [],
  summary: {
    totalAssessments: 0,
    totalSubmissions: 0,
    totalLateSubmissions: 0,
  },
  modules: [],
  pagination: null,
  filters: { search: "", moduleId: "ALL", page: 1 },
};

export function StaffAssessmentsLoading() {
  return <StaffAssessmentsView data={emptyData} />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>
): StaffAssessmentsFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);

  return {
    search: typeof query.search === "string" ? query.search : "",
    moduleId:
      typeof query.moduleId === "string" && query.moduleId ? query.moduleId : "ALL",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface StaffAssessmentsContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function StaffAssessmentsContent({
  searchParams,
}: StaffAssessmentsContentProps) {
  // Mark this region as request-time before any URL read, so the deadline
  // comparisons below are never evaluated against a prerendered clock.
  await connection();

  const filters = readFilters(await searchParams);

  // The KPI counters are a separate, unfiltered read so they always describe the whole portal.
  const [list, summary, modules] = await Promise.all([
    getStaffAssessments({
      search: filters.search || undefined,
      moduleId: filters.moduleId === "ALL" ? undefined : filters.moduleId,
      page: filters.page,
      pageSize: PAGE_SIZE,
    }),
    getStaffAssessmentSummary(),
    listModules(),
  ]);

  const data: StaffAssessmentsData = {
    assessments: list.assessments,
    summary,
    modules,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
  };

  return <StaffAssessmentsView data={data} />;
}
