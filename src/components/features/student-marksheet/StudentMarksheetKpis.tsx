"use client";

import StatCard from "@/components/ui/stats/StatCard";
import type { StudentMarksheetStats } from "@/types/marksheet";
import {
  HiOutlineDocumentReport,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
} from "react-icons/hi";

interface StudentMarksheetKpisProps {
  stats: StudentMarksheetStats;
}

export function StudentMarksheetKpis({ stats }: StudentMarksheetKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Published Results"
        value={stats.publishedResultsCount}
        icon={<HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />}
        subtitle={`Out of ${stats.totalAssessments} assessments`}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50/50"
        borderColor="border-emerald-200"
      />

      <StatCard
        title="Average Score"
        value={stats.averageGrade !== null ? `${stats.averageGrade}%` : "N/A"}
        icon={<HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />}
        subtitle="Across published modules"
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50/50"
        borderColor="border-indigo-200"
      />

      <StatCard
        title="Current Classification"
        value={stats.overallClassification || "Pending"}
        icon={<HiOutlineDocumentReport className="w-5 h-5 text-blue-600" />}
        subtitle="Based on published grades"
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        bgColor="bg-blue-50/50"
        borderColor="border-blue-200"
      />

      <StatCard
        title="Withheld / Pending"
        value={stats.withheldOrPendingCount}
        icon={<HiOutlineLockClosed className="w-5 h-5 text-amber-600" />}
        subtitle="Not yet certified for release"
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
        bgColor="bg-amber-50/50"
        borderColor="border-amber-200"
      />
    </div>
  );
}
