"use client";

import Link from "next/link";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PriorityOverdueStudent } from "@/types/dashboard";
import { HiOutlineExclamationCircle, HiOutlineArrowRight } from "react-icons/hi";
import { MdPayment } from "react-icons/md";
import type { FeeAccountItem } from "@/features/fees/RecordPaymentForm";

interface OverdueAccountsPanelProps {
  students: PriorityOverdueStudent[];
  onRecordPayment: (feeAccount: FeeAccountItem) => void;
}

export function OverdueAccountsPanel({
  students,
  onRecordPayment,
}: OverdueAccountsPanelProps) {
  const overdueColumns: Column<PriorityOverdueStudent>[] = [
    {
      key: "student",
      header: "Student",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{item.studentName}</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="font-mono">{item.studentId}</span>
            <span>&bull;</span>
            <span>{item.programmeCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Outstanding Balance",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-rose-600 font-mono">
            {formatCurrency(item.balance)}
          </span>
          <span className="text-[11px] text-slate-400">
            Due {formatDate(item.dueDate)}
          </span>
        </div>
      ),
    },
    {
      key: "delay",
      header: "Delay",
      render: (item) => (
        <Badge variant="danger" size="sm">
          {item.daysOverdue} {item.daysOverdue === 1 ? "day" : "days"} overdue
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      headerClassName: "text-right",
      render: (item) => (
        <TableActionButton
          tooltip="Record payment"
          onClick={() =>
            onRecordPayment({
              id: item.studentFeeId,
              studentId: item.studentId,
              fullName: item.studentName,
              amountDue: item.amountDue,
              totalPaid: item.totalPaid,
              balance: item.balance,
              dueDate: item.dueDate,
            })
          }
        >
          <MdPayment className="w-4 h-4" />
        </TableActionButton>
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-rose-200 bg-white shadow-xs overflow-visible">
      <div className="flex items-center justify-between p-4 sm:px-6 border-b border-rose-100 bg-rose-50/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
            <HiOutlineExclamationCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Priority Overdue Accounts
            </h2>
            <p className="text-xs text-rose-700">
              Students with past-due balances requiring immediate collection follow-up
            </p>
          </div>
        </div>

        <Link
          href="/fees"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>View Fee Ledger</span>
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <DataTable
        columns={overdueColumns}
        data={students}
        emptyMessage="No overdue student accounts detected. All fees are in good standing."
      />
    </div>
  );
}
