import {
  findFeesWithStudents,
  recordPaymentTransaction,
  FeeFilterParams,
} from "@/server/repositories/fee.repository";
import { RecordPaymentInput } from "@/lib/validations/fee";

export async function listFees(filters: FeeFilterParams) {
  const ledger = await findFeesWithStudents(filters);

  // Compute aggregate totals for KPI cards
  const totalInvoiced = ledger.reduce((acc, item) => acc + item.amountDue, 0);
  const totalCollected = ledger.reduce((acc, item) => acc + item.totalPaid, 0);
  const totalOutstanding = ledger.reduce((acc, item) => acc + item.balance, 0);
  const overdueCount = ledger.filter((item) => item.status === "OVERDUE").length;

  return {
    ledger,
    summary: {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      overdueCount,
    },
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
