import StatCard from "@/components/ui/stats/StatCard";
import type { AssessmentSummary } from "@/types/assessments";
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-sm:grid-cols-2">
      <StatCard
        title="Assessments"
        value={summary.totalAssessments}
        subtitle="All modules"
        icon={<HiOutlineClipboardList className="w-6 h-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />

      <StatCard
        title="Submissions"
        value={summary.totalSubmissions}
        subtitle="Uploads received"
        icon={<HiOutlineDocumentText className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />

      <StatCard
        title="Late"
        value={summary.totalLateSubmissions}
        subtitle="Past deadline"
        icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
        iconBgColor="bg-rose-100"
        iconColor="text-rose-600"
        bgColor="bg-rose-50/50"
        borderColor="border-rose-200"
        className="max-sm:col-span-2"
      />
    </div>
  );
}
