"use client";

import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { formatDateTime } from "@/lib/utils";
import type { StudentAssessmentItem } from "@/types/student-assessments";
import {
  HiOutlineUpload,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { FiClock } from "react-icons/fi";

interface StudentAssessmentsTableProps {
  assessments: StudentAssessmentItem[];
  isLoading: boolean;
  emptyMessage: string;
  onSubmit: (item: StudentAssessmentItem) => void;
  onViewHistory: (item: StudentAssessmentItem) => void;
}

export function StudentAssessmentsTable({
  assessments,
  isLoading,
  emptyMessage,
  onSubmit,
  onViewHistory,
}: StudentAssessmentsTableProps) {
  const columns: Column<StudentAssessmentItem>[] = [
    {
      key: "module",
      header: "Module",
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Badge variant="info" size="sm">
              {item.module.code}
            </Badge>
          </div>
          <span className="text-sm font-semibold text-slate-800 mt-1">
            {item.module.title}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Assessment",
      render: (item) => (
        <div className="flex flex-col max-w-sm">
          <span className="text-sm font-medium text-slate-900">{item.title}</span>
          <span className="text-xs text-gray-500 mt-0.5">
            Programme: {item.module.programme.name}
          </span>
        </div>
      ),
    },
    {
      key: "deadline",
      header: "Deadline",
      render: (item) => (
        <div className="flex flex-col">
          <span
            className={`text-xs font-semibold ${item.isPastDeadline ? "text-red-600" : "text-slate-800"
              }`}
          >
            {formatDateTime(item.deadline)}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">
            {item.isPastDeadline ? "Deadline passed" : "Accepting submissions"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Submission Status",
      render: (item) => {
        if (!item.submission) {
          return item.isPastDeadline ? (
            <Badge variant="danger" size="sm">
              <span className="flex items-center gap-1">
                <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                Overdue (Pending)
              </span>
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              <span className="flex items-center gap-1">
                <HiOutlineClock className="w-3.5 h-3.5" />
                Not Submitted
              </span>
            </Badge>
          );
        }

        return (
          <div className="flex flex-col gap-1 items-start">
            {item.submission.isLate ? (
              <Badge variant="danger" size="sm">
                <span className="flex items-center gap-1">
                  <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                  Late Submission
                </span>
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                <span className="flex items-center gap-1">
                  <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                  Submitted On-Time
                </span>
              </Badge>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-indigo-600">
                v{item.submission.latestVersionNumber}
              </span>
              <span>&bull;</span>
              <span className="truncate max-w-[120px]" title={item.submission.fileName}>
                {item.submission.fileName}
              </span>
            </div>
            {item.submission.isLate && item.submission.lateDurationText && (
              <span className="text-[10px] text-red-600 font-medium">
                {item.submission.lateDurationText}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.submission && item.submission.versions.length > 0 && (
            <TableActionButton
              tooltip={`Version history (${item.submission.totalVersions})`}
              onClick={() => onViewHistory(item)}
            >
              <FiClock className="w-4 h-4" />
            </TableActionButton>
          )}

          <TableActionButton
            tooltip={item.submission ? "Resubmit work" : "Submit work"}
            onClick={() => onSubmit(item)}
          >
            <HiOutlineUpload className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-visible">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="text-xs text-gray-500 mt-3 font-medium">
            Loading assessments...
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={assessments}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}
