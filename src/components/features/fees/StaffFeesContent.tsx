import { connection } from "next/server";
import {
  getStaffFeeSummary,
  getStaffFees,
} from "@/server/services/fee.service";
import type {
  FeeStatusFilter,
  StaffFeesData,
  StaffFeesFilters,
} from "@/types/fees";
import { StaffFeesView } from "./StaffFeesView";

const PAGE_SIZE = 5;

const STATUS_FILTERS: FeeStatusFilter[] = [
  "ALL",
  "PAID",
  "PARTIAL",
  "OVERDUE",
];

const emptyData: StaffFeesData = {
  ledger: [],
  summary: {
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    overdueCount: 0,
  },
  pagination: null,
  filters: { search: "", statusFilter: "ALL", page: 1 },
};

export function StaffFeesLoading() {
  return <StaffFeesView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>
): StaffFeesFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawStatus =
    typeof query.status === "string" ? query.status.toUpperCase() : "ALL";

  return {
    search: typeof query.search === "string" ? query.search : "",
    statusFilter:
      STATUS_FILTERS.find((option) => option === rawStatus) || "ALL",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface StaffFeesContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function StaffFeesContent({
  searchParams,
}: StaffFeesContentProps) {
  // Mark this region as request-time before any URL read, so the ledger
  // is never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  // The KPI counters are a separate, unfiltered read so they always describe the whole ledger.
  const [list, summary] = await Promise.all([
    getStaffFees({
      search: filters.search || undefined,
      status:
        filters.statusFilter === "ALL" ? undefined : filters.statusFilter,
      page: filters.page,
      pageSize: PAGE_SIZE,
    }),
    getStaffFeeSummary(),
  ]);

  const data: StaffFeesData = {
    ledger: list.items,
    summary,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
  };

  return <StaffFeesView data={data} />;
}
