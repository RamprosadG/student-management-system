import {
  findFeesWithStudents,
  recordPaymentTransaction,
} from "@/server/repositories/fee.repository";
import { FeeFilterParams } from "@/server/types/fee";
import { RecordPaymentInput } from "@/lib/validations/fee";
import {
  DEFAULT_PAGE_SIZE,
  buildPaginationMeta,
} from "@/lib/utils";

export async function listFees(filters: FeeFilterParams) {
  const fullLedger = await findFeesWithStudents(filters);

  // Compute aggregate totals for KPI cards over the entire filtered set
  const totalInvoiced = fullLedger.reduce((acc, item) => acc + item.amountDue, 0);
  const totalCollected = fullLedger.reduce((acc, item) => acc + item.totalPaid, 0);
  const totalOutstanding = fullLedger.reduce((acc, item) => acc + item.balance, 0);
  const overdueCount = fullLedger.filter((item) => item.status === "OVERDUE").length;

  const pageSize =
    filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const pagination = buildPaginationMeta(
    filters.page ?? 1,
    pageSize,
    fullLedger.length
  );
  const start = (pagination.page - 1) * pageSize;
  const ledger = fullLedger.slice(start, start + pageSize);

  return {
    ledger,
    summary: {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      overdueCount,
    },
    pagination,
  };
}

export async function createPayment(input: RecordPaymentInput) {
  return recordPaymentTransaction({
    studentFeeId: input.studentFeeId,
    amount: input.amount,
    referenceNumber: input.referenceNumber,
    paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
  });
}
