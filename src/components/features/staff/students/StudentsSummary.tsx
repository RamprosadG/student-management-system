import StatCard from "@/components/ui/stats/StatCard";
import type { StudentStatusSummary } from "@/types/students";
import {
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUserGroup,
} from "react-icons/hi";

interface StudentsSummaryProps {
  summary: StudentStatusSummary;
}

export function StudentsSummary({ summary }: StudentsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-sm:grid-cols-2">
      <StatCard
        title="Enrolled"
        value={summary.enrolled}
        subtitle="Active students"
        icon={<HiOutlineUserGroup className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />

      <StatCard
        title="Deferred"
        value={summary.deferred}
        subtitle="Paused intake"
        icon={<HiOutlineClock className="w-6 h-6" />}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        bgColor="bg-amber-50/50"
        borderColor="border-amber-200"
      />

      <StatCard
        title="Withdrawn"
        value={summary.withdrawn}
        subtitle="Left programme"
        icon={<HiOutlineBan className="w-6 h-6" />}
        iconBgColor="bg-rose-100"
        iconColor="text-rose-600"
        bgColor="bg-rose-50/50"
        borderColor="border-rose-200"
      />

      <StatCard
        title="Completed"
        value={summary.completed}
        subtitle="Graduated"
        icon={<HiOutlineCheckCircle className="w-6 h-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />
    </div>
  );
}
