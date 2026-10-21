import {
  findStaffFeePage,
  findStaffFeeSummary,
  recordPaymentTransaction,
} from "@/server/repositories/fee.repository";
import { connection } from "next/server";
import { RecordPaymentInput } from "@/lib/validations/fee";
import {
  StaffFeeFilterParams,
  StaffFeeListQuery,
  StaffFeeListResult,
  StaffFeeStatusFilter,
  StaffFeeSummary,
} from "@/server/types/fee";

const FEE_STATUSES: StaffFeeStatusFilter[] = [
  "ALL",
  "PAID",
  "PARTIAL",
  "OVERDUE",
];

function normalizeStatus(status?: string): StaffFeeStatusFilter {
  if (!status) return "ALL";

  return (
    FEE_STATUSES.find((option) => option === status.toUpperCase()) || "ALL"
  );
}

export async function getStaffFees(
  query: StaffFeeListQuery
): Promise<StaffFeeListResult> {
  // Balances move whenever a payment is recorded, so never prerender this.
  await connection();

  const filters: StaffFeeFilterParams = {
    search: query.search,
    status: normalizeStatus(query.status),
    page: query.page,
    pageSize: query.pageSize,
  };

  return await findStaffFeePage(filters);
}

export async function getStaffFeeSummary(): Promise<StaffFeeSummary> {
  // The ledger counters describe every fee account, not the current filter.
  await connection();

  return await findStaffFeeSummary();
}

export async function createPayment(input: RecordPaymentInput) {
  return recordPaymentTransaction({
    studentFeeId: input.studentFeeId,
    amount: input.amount,
    referenceNumber: input.referenceNumber,
    paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
  });
}
