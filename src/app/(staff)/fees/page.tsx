"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/buttons/Button";
import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Modal from "@/components/ui/modals/Modal";
import StatCard from "@/components/ui/stats/StatCard";
import {
  RecordPaymentForm,
  FeeAccountItem,
} from "@/features/fees/RecordPaymentForm";
import { PaymentHistoryModal } from "@/features/fees/PaymentHistoryModal";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiRefresh,
  HiOutlineReceiptTax,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { MdPayment } from "react-icons/md";

interface FeeItem {
  id: string; // studentFeeId
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
  status: "PAID" | "PARTIAL" | "OVERDUE";
  payments: Array<{
    id: string;
    amount: number;
    paidAt: string;
    referenceNumber: string;
  }>;
}

interface FinancialSummary {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
}

export default function FeesPage() {
  const [ledger, setLedger] = useState<FeeItem[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    overdueCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [selectedFeeForPayment, setSelectedFeeForPayment] =
    useState<FeeAccountItem | null>(null);
  const [selectedFeeForHistory, setSelectedFeeForHistory] =
    useState<FeeItem | null>(null);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/fees?${params.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        setLedger(result.data.ledger || []);
        setSummary(
          result.data.summary || {
            totalInvoiced: 0,
            totalCollected: 0,
            totalOutstanding: 0,
            overdueCount: 0,
          }
        );
      }
    } catch (e) {
      console.error("Failed to load fee ledger", e);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const statusVariantMap = {
    PAID: "success",
    PARTIAL: "warning",
    OVERDUE: "danger",
  } as const;

  const statusFilterOptions = [
    { value: "ALL", label: "All Payment Statuses" },
    { value: "PAID", label: "Paid in Full" },
    { value: "PARTIAL", label: "Partial Balance" },
    { value: "OVERDUE", label: "Overdue" },
  ];

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
              onClick={() => setSelectedFeeForHistory(item)}
            >
              <HiOutlineReceiptTax className="w-4 h-4" />
            </TableActionButton>
          )}

          {item.balance > 0 ? (
            <TableActionButton
              tooltip="Record payment"
              onClick={() =>
                setSelectedFeeForPayment({
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
            <TableActionButton tooltip="Fee settled" disabled>
              <HiOutlineCheckCircle className="w-4 h-4" />
            </TableActionButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fees & Payments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track programme fee assignments, record transactions, and monitor real-time balances.
          </p>
        </div>
        <div>
          <Button
            variant="secondary-outline"
            size="md"
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={() => fetchFees()}
          >
            Refresh Ledger
          </Button>
        </div>
      </div>

      {/* Financial Summary KPI Cards matching spend-smart design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(summary.totalInvoiced)}
          subtitle="All assigned programme fees"
          icon={<HiOutlineCash className="w-6 h-6" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50/50"
          borderColor="border-indigo-200"
        />

        <StatCard
          title="Total Collected"
          value={formatCurrency(summary.totalCollected)}
          subtitle="Total verified payments"
          icon={<HiOutlineCreditCard className="w-6 h-6" />}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50/50"
          borderColor="border-emerald-200"
        />

        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(summary.totalOutstanding)}
          subtitle="Pending student receivables"
          icon={<HiOutlineClock className="w-6 h-6" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          bgColor="bg-amber-50/50"
          borderColor="border-amber-200"
        />

        <StatCard
          title="Overdue Accounts"
          value={summary.overdueCount}
          subtitle="Past due date with balance"
          icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          bgColor="bg-rose-50/50"
          borderColor="border-rose-200"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
        {/* Search Input takes all remaining space */}
        <div className="flex-1 w-full min-w-0">
          <SearchInput
            value={search}
            onDebouncedChange={(val) => setSearch(val)}
            placeholder="Search student name, ID or email..."
          />
        </div>

        <div className="w-full sm:w-60 shrink-0">
          <Dropdown
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Filter Payment Status"
          />
        </div>
      </div>

      {/* Fee Ledger Table */}
      <DataTable
        data={ledger}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No fee records found."
      />

      {/* Record Payment Modal */}
      <Modal
        isOpen={Boolean(selectedFeeForPayment)}
        onClose={() => setSelectedFeeForPayment(null)}
        title="Record Payment Transaction"
      >
        {selectedFeeForPayment && (
          <RecordPaymentForm
            feeAccount={selectedFeeForPayment}
            onSuccess={() => {
              setSelectedFeeForPayment(null);
              fetchFees();
            }}
            onCancel={() => setSelectedFeeForPayment(null)}
          />
        )}
      </Modal>

      {/* Payment History Modal */}
      <Modal
        isOpen={Boolean(selectedFeeForHistory)}
        onClose={() => setSelectedFeeForHistory(null)}
        title="Payment Transaction History"
      >
        {selectedFeeForHistory && (
          <PaymentHistoryModal
            studentName={selectedFeeForHistory.fullName}
            studentId={selectedFeeForHistory.studentId}
            payments={selectedFeeForHistory.payments}
            onClose={() => setSelectedFeeForHistory(null)}
          />
        )}
      </Modal>
    </div>
  );
}
