import { connection } from "next/server";
import {
  getStaffStudents,
  getStaffStudentSummary,
  getStudentReferenceData,
} from "@/server/services/student.service";
import type {
  StaffStudentsData,
  StaffStudentsFilters,
  StudentStatusFilter,
} from "@/types/students";
import { StaffStudentsView } from "./StaffStudentsView";

const PAGE_SIZE = 5;

const STATUS_FILTERS: StudentStatusFilter[] = [
  "",
  "ENROLLED",
  "DEFERRED",
  "WITHDRAWN",
  "COMPLETED",
];

const emptyData: StaffStudentsData = {
  students: [],
  summary: { enrolled: 0, deferred: 0, withdrawn: 0, completed: 0 },
  meta: { programmes: [], academicYears: [] },
  pagination: null,
  filters: { search: "", programmeId: "", statusFilter: "", page: 1 },
};

export function StaffStudentsLoading() {
  return <StaffStudentsView data={emptyData} isLoading />;
}

function readFilters(
  query: Record<string, string | string[] | undefined>
): StaffStudentsFilters {
  const rawPage = Number(Array.isArray(query.page) ? query.page[0] : query.page);
  const rawStatus =
    typeof query.status === "string" ? query.status.toUpperCase() : "";

  return {
    search: typeof query.search === "string" ? query.search : "",
    programmeId:
      typeof query.programmeId === "string" ? query.programmeId : "",
    statusFilter:
      STATUS_FILTERS.find((option) => option === rawStatus) || "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface StaffStudentsContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function StaffStudentsContent({
  searchParams,
}: StaffStudentsContentProps) {
  // Mark this region as request-time before any URL read, so the registry
  // is never served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  // The KPI counters are a separate, unfiltered read so they always describe the whole registry.
  const [list, summary, meta] = await Promise.all([
    getStaffStudents({
      search: filters.search || undefined,
      programmeId: filters.programmeId || undefined,
      status: filters.statusFilter || undefined,
      page: filters.page,
      pageSize: PAGE_SIZE,
    }),
    getStaffStudentSummary(),
    getStudentReferenceData(),
  ]);

  const data: StaffStudentsData = {
    students: list.items,
    summary,
    meta,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
  };

  return <StaffStudentsView data={data} />;
}
