import StatCard from "@/components/ui/stats/StatCard";
import type { AssessmentSummary } from "@/types/staff-assessments";
import {
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

interface AssessmentsSummaryProps {
  summary: AssessmentSummary;
}

export function AssessmentsSummary({ summary }: AssessmentsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Total Assessments"
        value={summary.totalAssessments}
        subtitle="Across all curriculum modules"
        icon={<HiOutlineClipboardList className="w-6 h-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />

      <StatCard
        title="Total Submissions"
        value={summary.totalSubmissions}
        subtitle="Student uploads received"
        icon={<HiOutlineDocumentText className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />

      <StatCard
        title="Late Submissions"
        value={summary.totalLateSubmissions}
        subtitle="Past assessment deadline"
        icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
        iconBgColor="bg-rose-100"
        iconColor="text-rose-600"
        bgColor="bg-rose-50/50"
        borderColor="border-rose-200"
      />
    </div>
  );
}
