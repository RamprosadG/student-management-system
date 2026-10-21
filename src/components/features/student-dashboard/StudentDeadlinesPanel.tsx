"use client";

import Link from "next/link";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { TableActionLink } from "@/components/ui/buttons/TableActionButton";
import { formatDate } from "@/lib/utils";
import type { UpcomingDeadlineItem } from "@/types/student-dashboard";
import {
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineUpload,
} from "react-icons/hi";

interface StudentDeadlinesPanelProps {
  deadlines: UpcomingDeadlineItem[];
}

export function StudentDeadlinesPanel({ deadlines }: StudentDeadlinesPanelProps) {
  const deadlineColumns: Column<UpcomingDeadlineItem>[] = [
    {
      key: "module",
      header: "Module",
      render: (item) => (
        <div className="flex flex-col">
          <Badge variant="info" size="sm" className="w-fit">
            {item.moduleCode}
          </Badge>
          <span className="text-sm font-semibold text-slate-800 mt-1">
            {item.moduleTitle}
          </span>
        </div>
      ),
    },
    {
      key: "assessment",
      header: "Assessment Title",
      render: (item) => (
        <span className="text-sm font-medium text-slate-900">{item.title}</span>
      ),
    },
    {
      key: "deadline",
      header: "Submission Deadline",
      render: (item) => (
        <div className="flex flex-col">
          <span
            className={`text-xs font-bold ${item.isPastDeadline ? "text-red-600" : "text-slate-800"
              }`}
          >
            {formatDate(item.deadline)}
          </span>
          <span className="text-[11px] text-gray-400">
            {item.isPastDeadline ? "Deadline passed" : "Open for submissions"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Your Status",
      render: (item) => {
        if (!item.submission) {
          return item.isPastDeadline ? (
            <Badge variant="danger" size="sm">
              <span className="flex items-center gap-1">
                <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                Overdue
              </span>
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              <span className="flex items-center gap-1">
                <HiOutlineClock className="w-3.5 h-3.5" />
                Pending
              </span>
            </Badge>
          );
        }

        return (
          <Badge variant={item.submission.isLate ? "danger" : "success"} size="sm">
            <span className="flex items-center gap-1">
              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
              {item.submission.isLate ? "Submitted Late" : "Submitted On-Time"} (v{item.submission.versionNumber})
            </span>
          </Badge>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      headerClassName: "text-right",
      render: () => (
        <TableActionLink href="/student-assessments" tooltip="Upload work" color="indigo">
          <HiOutlineUpload className="w-4 h-4" />
        </TableActionLink>
      ),
    },
  ];

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Curriculum Assessments & Deadlines
          </h2>
        </div>
        <Link
          href="/student-assessments"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <span>View All Submissions</span>
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <DataTable
        columns={deadlineColumns}
        data={deadlines}
        emptyMessage="No assessment deadlines currently assigned to your programme."
      />
    </div>
  );
}
