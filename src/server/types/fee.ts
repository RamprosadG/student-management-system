import type { PaginationMeta } from "./pagination";

export type StaffFeeStatus = "PAID" | "PARTIAL" | "OVERDUE";

export type StaffFeeStatusFilter = "ALL" | StaffFeeStatus;

export interface StaffFeeFilterParams {
  search?: string;
  status?: StaffFeeStatusFilter;
  page: number;
  pageSize: number;
}

export interface StaffFeeListQuery {
  search?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface StaffFeePaymentRow {
  id: string;
  amount: number;
  paidAt: string;
  referenceNumber: string;
}

export interface StaffFeeRow {
  id: string;
  studentId: string;
  studentUuid: string;
  fullName: string;
  email: string;
  programmeCode: string;
  programmeName: string;
  academicYear: string;
  amountDue: number;
  totalPaid: number;
  balance: number;
  dueDate: string;
  status: StaffFeeStatus;
  payments: StaffFeePaymentRow[];
}

export interface StaffFeeListResult {
  items: StaffFeeRow[];
  pagination: PaginationMeta;
}

export interface StaffFeeSummary {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
}
