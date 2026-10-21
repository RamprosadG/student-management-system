import type { EnrolmentStatus } from "@/generated/prisma/client";
import type { PaginationMeta } from "./pagination";

export interface StaffStudentFilterParams {
  search?: string;
  programmeId?: string;
  status?: EnrolmentStatus;
  page: number;
  pageSize: number;
}

export interface StaffStudentListQuery {
  search?: string;
  programmeId?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface StaffStudentRow {
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
  studentFee: {
    id: string;
    amountDue: number;
    dueDate: string;
  } | null;
}

export interface StaffStudentListResult {
  items: StaffStudentRow[];
  pagination: PaginationMeta;
}

export interface StaffStudentSummary {
  enrolled: number;
  deferred: number;
  withdrawn: number;
  completed: number;
}

export interface StaffStudentReferenceData {
  programmes: Array<{ id: string; code: string; name: string }>;
  academicYears: Array<{ id: string; name: string }>;
}
