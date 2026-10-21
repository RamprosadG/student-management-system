import type { PaginationMeta } from "@/types/pagination";

export type FeeStatus = "PAID" | "PARTIAL" | "OVERDUE";
export type FeeStatusFilter = "ALL" | FeeStatus;

export interface FeePayment {
  id: string;
  amount: number;
  paidAt: string;
  referenceNumber: string;
}

export interface FeeItem {
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
  status: FeeStatus;
  payments: FeePayment[];
}

export interface FinancialSummary {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
}

export interface StaffFeesFilters {
  search: string;
  statusFilter: FeeStatusFilter;
  page: number;
}

export interface StaffFeesData {
  ledger: FeeItem[];
  summary: FinancialSummary;
  pagination: PaginationMeta | null;
  filters: StaffFeesFilters;
}
