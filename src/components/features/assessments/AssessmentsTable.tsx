"use client";

import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { AssessmentItem } from "@/types/staff-assessments";
import { HiOutlineEye } from "react-icons/hi";

interface AssessmentsTableProps {
  assessments: AssessmentItem[];
  isLoading: boolean;
  onInspect: (item: AssessmentItem) => void;
}

export function AssessmentsTable({
  assessments,
  isLoading,
  onInspect,
}: AssessmentsTableProps) {
  const columns: Column<AssessmentItem>[] = [
    {
      key: "module",
      header: "Module",
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Badge variant="info" size="sm">
              {item.module.code}
            </Badge>
            <span className="text-xs text-gray-500 font-mono">
              {item.module.programme.code}
            </span>
          </div>
          <span className="text-sm font-semibold text-slate-800 mt-1">
            {item.module.title}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Assessment Title",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">{item.title}</span>
          <span className="text-xs text-gray-400">
            Created {formatDate(item.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: "deadline",
      header: "Deadline",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800 font-mono">
            {formatDateTime(item.deadline)}
          </span>
          {item.isPastDeadline ? (
            <span className="text-[11px] font-medium text-rose-600 mt-0.5">
              Closed
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-600 mt-0.5">
              Active / Open
            </span>
          )}
        </div>
      ),
    },
    {
      key: "submissions",
      header: "Submissions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">
              {item.stats.totalSubmissions} total
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
              <span className="text-emerald-700 font-medium">
                {item.stats.onTimeSubmissionsCount} on time
              </span>
              {item.stats.lateSubmissionsCount > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-rose-600 font-medium">
                    {item.stats.lateSubmissionsCount} late
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge
          variant={item.isPastDeadline ? "neutral" : "success"}
          size="md"
        >
          {item.isPastDeadline ? "Past Deadline" : "Accepting Submissions"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => (
        <TableActionButton
          tooltip="Inspect submissions"
          onClick={(e) => {
            e.stopPropagation();
            onInspect(item);
          }}
        >
          <HiOutlineEye className="w-4 h-4" />
        </TableActionButton>
      ),
    },
  ];

  return (
    <DataTable
      data={assessments}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No assessments found. Click 'Create Assessment' to publish your first one."
    />
  );
}
