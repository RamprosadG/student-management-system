import StatCard from "@/components/ui/stats/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { StaffDashboardKpis as StaffDashboardKpisData } from "@/types/dashboard";
import {
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineExclamationCircle,
  HiOutlineDocumentReport,
} from "react-icons/hi";

interface DashboardKpisProps {
  kpis: StaffDashboardKpisData;
}

export function DashboardKpis({ kpis }: DashboardKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Enrolled Students"
        value={kpis.enrolledStudents}
        subtitle={`Total records: ${kpis.totalStudents}`}
        icon={<HiOutlineAcademicCap className="w-6 h-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />

      <StatCard
        title="Outstanding Fees"
        value={formatCurrency(kpis.totalOutstandingBalance)}
        subtitle="Real-time uncollected tuition"
        icon={<HiOutlineCreditCard className="w-6 h-6" />}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        bgColor="bg-amber-50/50"
        borderColor="border-amber-200"
      />

      <StatCard
        title="Overdue Accounts"
        value={kpis.overdueAccountsCount}
        subtitle="Past due date & unpaid"
        icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
        iconBgColor="bg-rose-100"
        iconColor="text-rose-600"
        bgColor="bg-rose-50/50"
        borderColor="border-rose-200"
      />

      <StatCard
        title="Pending Evaluations"
        value={kpis.pendingGradingCount}
        subtitle={`Across ${kpis.totalAssessments} assessments`}
        icon={<HiOutlineDocumentReport className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />
    </div>
  );
}
