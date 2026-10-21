import { connection } from "next/server";
import {
  getStaffResultSummary,
  getStaffResults,
} from "@/server/services/result.service";
import { listModules } from "@/server/services/module.service";
import type {
  PublishFilter,
  StaffResultsData,
  StaffResultsFilters,
} from "@/types/results";
import { StaffResultsView } from "./StaffResultsView";

const PAGE_SIZE = 5;

const PUBLISH_FILTERS: PublishFilter[] = [
  "ALL",
  "PUBLISHED",
  "WITHHELD",
  "UNGRADED",
];

const emptyData: StaffResultsData = {
  items: [],
  summary: {
    totalSubmissions: 0,
    gradedCount: 0,
    publishedCount: 0,
    withheldCount: 0,
  },
  modules: [],
  pagination: null,
  filters: { search: "", moduleId: "ALL", publishFilter: "ALL", page: 1 },
};

export function StaffResultsLoading() {
  return <StaffResultsView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>
): StaffResultsFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawStatus =
    typeof query.publishStatus === "string"
      ? query.publishStatus.toUpperCase()
      : "ALL";

  return {
    search: typeof query.search === "string" ? query.search : "",
    moduleId:
      typeof query.moduleId === "string" && query.moduleId ? query.moduleId : "ALL",
    publishFilter:
      PUBLISH_FILTERS.find((option) => option === rawStatus) || "ALL",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface StaffResultsContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function StaffResultsContent({
  searchParams,
}: StaffResultsContentProps) {
  // Mark this region as request-time before any URL read, so the ledger
  // is never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  // The KPI counters are a separate, unfiltered read so they always describe the whole ledger.
  const [list, summary, modules] = await Promise.all([
    getStaffResults({
      search: filters.search || undefined,
      moduleId: filters.moduleId === "ALL" ? undefined : filters.moduleId,
      publishStatus: filters.publishFilter,
      page: filters.page,
      pageSize: PAGE_SIZE,
    }),
    getStaffResultSummary(),
    listModules(),
  ]);

  const data: StaffResultsData = {
    items: list.items,
    summary,
    modules,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
  };

  return <StaffResultsView data={data} />;
}
