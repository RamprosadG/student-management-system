import StatCard from "@/components/ui/stats/StatCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  StudentAcademicProgress,
  StudentFinancialSummary,
} from "@/types/student-dashboard";
import {
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineExclamationCircle,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
} from "react-icons/hi";

interface StudentDashboardKpisProps {
  finance: StudentFinancialSummary;
  academic: StudentAcademicProgress;
}

export function StudentDashboardKpis({ finance, academic }: StudentDashboardKpisProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tuition Balance"
          value={formatCurrency(finance.balance)}
          subtitle={
            finance.status === "PAID"
              ? "All fees settled"
              : finance.status === "OVERDUE"
                ? `${finance.daysOverdue} days past due`
                : `Due: ${finance.dueDate ? formatDate(finance.dueDate) : "Scheduled"}`
          }
          icon={<HiOutlineCreditCard className="w-6 h-6" />}
          iconBgColor={
            finance.status === "PAID"
              ? "bg-emerald-100"
              : finance.status === "OVERDUE"
                ? "bg-rose-100"
                : "bg-amber-100"
          }
          iconColor={
            finance.status === "PAID"
              ? "text-emerald-600"
              : finance.status === "OVERDUE"
                ? "text-rose-600"
                : "text-amber-600"
          }
          bgColor={
            finance.status === "PAID"
              ? "bg-emerald-50/50"
              : finance.status === "OVERDUE"
                ? "bg-rose-50/50"
                : "bg-amber-50/50"
          }
          borderColor={
            finance.status === "PAID"
              ? "border-emerald-200"
              : finance.status === "OVERDUE"
                ? "border-rose-200"
                : "border-amber-200"
          }
        />

        <StatCard
          title="Assessments Handed In"
          value={`${academic.submittedCount} / ${academic.totalAssigned}`}
          subtitle={`${academic.pendingCount} pending submission`}
          icon={<HiOutlineClipboardList className="w-6 h-6" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50/50"
          borderColor="border-indigo-200"
        />

        <StatCard
          title="Published Grade Average"
          value={
            academic.averageGrade !== null
              ? `${academic.averageGrade}%`
              : "Pending"
          }
          subtitle={`${academic.publishedCount} results released`}
          icon={<HiOutlineAcademicCap className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          bgColor="bg-blue-50/50"
          borderColor="border-blue-200"
        />

        <StatCard
          title="Academic Standing"
          value={academic.overallClassification || "In Progress"}
          subtitle="Based on published marks"
          icon={<HiOutlineDocumentReport className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          bgColor="bg-purple-50/50"
          borderColor="border-purple-200"
        />
      </div>

      {finance.status === "OVERDUE" && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-4 flex items-start gap-3">
          <HiOutlineExclamationCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 space-y-1">
            <span className="font-bold text-sm block">Action Required: Overdue Tuition Balance</span>
            <p>
              Your account has an outstanding balance of <strong>{formatCurrency(finance.balance)}</strong> which was due on{" "}
              {finance.dueDate ? formatDate(finance.dueDate) : "the scheduled date"}. Please contact Registry Finance or submit your payment receipt reference to avoid administrative withholding.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
