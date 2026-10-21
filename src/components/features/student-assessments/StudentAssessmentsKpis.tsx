import StatCard from "@/components/ui/stats/StatCard";
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi";

interface StudentAssessmentsKpisProps {
  totalAssessments: number;
  submittedCount: number;
  pendingCount: number;
  overdueCount: number;
}

export function StudentAssessmentsKpis({
  totalAssessments,
  submittedCount,
  pendingCount,
  overdueCount,
}: StudentAssessmentsKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Assigned"
        value={totalAssessments}
        subtitle="In your enrolled programme"
        icon={<HiOutlineClipboardList className="w-6 h-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />

      <StatCard
        title="Submitted"
        value={submittedCount}
        subtitle="Assessments handed in"
        icon={<HiOutlineCheckCircle className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />

      <StatCard
        title="Pending Action"
        value={pendingCount}
        subtitle="Awaiting your submission"
        icon={<HiOutlineClock className="w-6 h-6" />}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        bgColor="bg-amber-50/50"
        borderColor="border-amber-200"
      />

      <StatCard
        title="Overdue"
        value={overdueCount}
        subtitle="Past deadline & unsubmitted"
        icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
        iconBgColor="bg-rose-100"
        iconColor="text-rose-600"
        bgColor="bg-rose-50/50"
        borderColor="border-rose-200"
      />
    </div>
  );
}
