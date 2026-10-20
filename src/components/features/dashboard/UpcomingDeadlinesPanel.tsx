"use client";

import Link from "next/link";
import Badge from "@/components/ui/badges/Badge";
import { formatDate } from "@/lib/utils";
import type { UpcomingDeadline } from "@/types/dashboard";
import { HiOutlineClock, HiOutlineArrowRight } from "react-icons/hi";

interface UpcomingDeadlinesPanelProps {
  deadlines: UpcomingDeadline[];
}

export function UpcomingDeadlinesPanel({ deadlines }: UpcomingDeadlinesPanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <HiOutlineClock className="w-5 h-5 text-indigo-600 shrink-0" />
          <h2 className="text-base font-bold text-slate-900">
            Assessment Deadlines
          </h2>
        </div>

        <Link
          href="/assessments"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
        >
          <span>Manage Assessments</span>
          <HiOutlineArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm divide-y divide-slate-200">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Assessment</th>
              <th className="px-4 py-3 font-semibold">Deadline</th>
              <th className="px-4 py-3 font-semibold text-center">
                Submissions
              </th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {deadlines.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No active assessment deadlines scheduled.
                </td>
              </tr>
            ) : (
              deadlines.map((item, index) => (
                <tr
                  key={item.assessmentId}
                  className={`transition-colors hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-100"
                    }`}
                >
                  <td className="px-4 py-3">
                    <div className="min-w-0 max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase text-indigo-700">
                          {item.moduleCode}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({item.programmeCode})
                        </span>
                      </div>
                      <p
                        className="mt-1 text-sm font-semibold text-slate-900 truncate"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-semibold ${item.isPastDeadline
                        ? "text-rose-600"
                        : "text-slate-700"
                        }`}
                    >
                      {formatDate(item.deadline)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-700">
                      {item.submissionCount}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={item.isPastDeadline ? "neutral" : "info"}
                      size="sm"
                    >
                      {item.isPastDeadline ? "Closed" : "Active"}
                    </Badge>
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
