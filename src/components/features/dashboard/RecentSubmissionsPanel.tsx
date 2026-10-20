"use client";

import Link from "next/link";
import Badge from "@/components/ui/badges/Badge";
import { formatDate } from "@/lib/utils";
import type { RecentSubmission } from "@/types/dashboard";
import { HiOutlineClipboardList, HiOutlineArrowRight } from "react-icons/hi";

interface RecentSubmissionsPanelProps {
  submissions: RecentSubmission[];
}

export function RecentSubmissionsPanel({ submissions }: RecentSubmissionsPanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineClipboardList className="w-5 h-5 text-indigo-600 shrink-0" />
          <h2 className="text-base font-bold text-slate-900">
            Recent Submissions
          </h2>
        </div>

        <Link
          href="/results"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
        >
          <span>Grade Submissions</span>
          <HiOutlineArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm divide-y divide-slate-200">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Student / Module</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Grade</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {submissions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No recent student submissions recorded.
                </td>
              </tr>
            ) : (
              submissions.map((sub, index) => (
                <tr
                  key={sub.submissionId}
                  className={`transition-colors hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-100"
                    }`}
                >
                  <td className="px-4 py-3">
                    <div className="min-w-0 max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase text-indigo-700">
                          {sub.moduleCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {sub.studentName}
                        </span>
                      </div>
                      <p
                        className="mt-1 text-xs text-slate-500 truncate"
                        title={sub.assessmentTitle}
                      >
                        {sub.assessmentTitle}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Version {sub.versionNumber}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                    {formatDate(sub.submittedAt)}
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {sub.isLate ? (
                      <Badge variant="danger" size="sm">
                        Late
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        On-time
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {sub.grade !== null ? (
                      <span className="text-sm font-bold font-mono text-slate-800">
                        {sub.grade}%
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600">
                        Ungraded
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
