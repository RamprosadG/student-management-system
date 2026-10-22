import StatCard from "@/components/ui/stats/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { FinancialSummary } from "@/types/fees";
import {
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineClock,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

interface FeesSummaryProps {
  summary: FinancialSummary;
}

export function FeesSummary({ summary }: FeesSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-sm:grid-cols-2">
      <StatCard
        title="Total Invoiced"
        value={formatCurrency(summary.totalInvoiced)}
        subtitle="Programme fees"
        icon={<HiOutlineCash className="w-6 h-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />

      <StatCard
        title="Total Collected"
        value={formatCurrency(summary.totalCollected)}
        subtitle="Verified payments"
        icon={<HiOutlineCreditCard className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />

      <StatCard
        title="Outstanding"
        value={formatCurrency(summary.totalOutstanding)}
        subtitle="Due from students"
        icon={<HiOutlineClock className="w-6 h-6" />}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        bgColor="bg-amber-50/50"
        borderColor="border-amber-200"
      />

      <StatCard
        title="Overdue"
        value={summary.overdueCount}
        subtitle="Past due balance"
        icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
        iconBgColor="bg-rose-100"
        iconColor="text-rose-600"
        bgColor="bg-rose-50/50"
        borderColor="border-rose-200"
      />
    </div>
  );
}
