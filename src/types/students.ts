import type { PaginationMeta } from "@/types/pagination";

export type EnrolmentStatus = "ENROLLED" | "DEFERRED" | "WITHDRAWN" | "COMPLETED";

export type StudentStatusFilter = EnrolmentStatus | "";

export interface StudentRecord {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  status: EnrolmentStatus;
  createdAt: string;
  programme: {
    id: string;
    code: string;
    name: string;
    standardFee: number;
  };
  academicYear: {
    id: string;
    name: string;
  };
  studentFee?: {
    id: string;
    amountDue: number;
    dueDate: string;
  } | null;
}

export interface ReferenceMeta {
  programmes: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string }>;
}

export interface StudentStatusSummary {
  enrolled: number;
  deferred: number;
  withdrawn: number;
  completed: number;
}

export interface StaffStudentsFilters {
  search: string;
  programmeId: string;
  statusFilter: StudentStatusFilter;
  page: number;
}

export interface StaffStudentsData {
  students: StudentRecord[];
  summary: StudentStatusSummary;
  meta: ReferenceMeta;
  pagination: PaginationMeta | null;
  filters: StaffStudentsFilters;
}
