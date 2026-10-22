import StatCard from "@/components/ui/stats/StatCard";
import {
  HiOutlineDocumentReport,
  HiOutlineCheckCircle,
  HiOutlineEyeOff,
  HiOutlineEye,
} from "react-icons/hi";

interface ResultsSummaryProps {
  totalSubmissions: number;
  gradedCount: number;
  publishedCount: number;
  withheldCount: number;
}

export function ResultsSummary({
  totalSubmissions,
  gradedCount,
  publishedCount,
  withheldCount,
}: ResultsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-sm:grid-cols-2">
      <StatCard
        title="Submissions"
        value={totalSubmissions}
        subtitle="Student uploads"
        icon={<HiOutlineDocumentReport className="w-6 h-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />

      <StatCard
        title="Graded"
        value={gradedCount}
        subtitle={`${totalSubmissions - gradedCount} awaiting score`}
        icon={<HiOutlineCheckCircle className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />

      <StatCard
        title="Published"
        value={publishedCount}
        subtitle="On marksheets"
        icon={<HiOutlineEye className="w-6 h-6" />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        bgColor="bg-blue-50/50"
        borderColor="border-blue-200"
      />

      <StatCard
        title="Withheld / Draft"
        value={withheldCount}
        subtitle="Internal only"
        icon={<HiOutlineEyeOff className="w-6 h-6" />}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        bgColor="bg-amber-50/50"
        borderColor="border-amber-200"
      />
    </div>
  );
}
