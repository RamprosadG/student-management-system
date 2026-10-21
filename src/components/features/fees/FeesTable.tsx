import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FeeItem } from "@/types/fees";
import type { FeeAccountItem } from "@/features/fees/RecordPaymentForm";
import { HiOutlineReceiptTax, HiOutlineCheckCircle } from "react-icons/hi";
import { MdPayment } from "react-icons/md";

interface FeesTableProps {
  ledger: FeeItem[];
  isLoading: boolean;
  onRecordPayment: (feeAccount: FeeAccountItem) => void;
  onViewHistory: (item: FeeItem) => void;
}

const statusVariantMap = {
  PAID: "success",
  PARTIAL: "warning",
  OVERDUE: "danger",
} as const;

export function FeesTable({
  ledger,
  isLoading,
  onRecordPayment,
  onViewHistory,
}: FeesTableProps) {
  const columns: Column<FeeItem>[] = [
    {
      key: "student",
      header: "Student",
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.fullName}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
              {item.studentId}
            </span>
            <span className="text-xs text-gray-500">{item.programmeCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: "amountDue",
      header: "Fee Amount",
      render: (item) => (
        <span className="font-medium text-slate-800">
          {formatCurrency(item.amountDue)}
        </span>
      ),
    },
    {
      key: "totalPaid",
      header: "Total Paid",
      render: (item) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(item.totalPaid)}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Outstanding Balance",
      render: (item) => (
        <span
          className={`font-bold font-mono ${item.balance === 0
            ? "text-gray-400"
            : item.status === "OVERDUE"
              ? "text-red-600"
              : "text-amber-600"
            }`}
        >
          {formatCurrency(item.balance)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (item) => (
        <div className="text-xs">
          <div className="text-slate-700 font-medium">
            {formatDate(item.dueDate)}
          </div>
          {item.status === "OVERDUE" && (
            <span className="text-red-500 font-semibold text-[11px]">
              Payment Past Due
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={statusVariantMap[item.status]} size="md">
          {item.status.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.payments.length > 0 && (
            <TableActionButton
              tooltip="View receipts"
              onClick={() => onViewHistory(item)}
            >
              <HiOutlineReceiptTax className="w-4 h-4" />
            </TableActionButton>
          )}

          {item.balance > 0 ? (
            <TableActionButton
              tooltip="Record payment"
              color="emerald"
              onClick={() =>
                onRecordPayment({
                  id: item.id,
                  studentId: item.studentId,
                  fullName: item.fullName,
                  amountDue: item.amountDue,
                  totalPaid: item.totalPaid,
                  balance: item.balance,
                  dueDate: item.dueDate,
                })
              }
            >
              <MdPayment className="w-4 h-4" />
            </TableActionButton>
          ) : (
            <TableActionButton tooltip="Fee settled" color="emerald" disabled>
              <HiOutlineCheckCircle className="w-4 h-4" />
            </TableActionButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={ledger}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No fee records found."
    />
  );
}
