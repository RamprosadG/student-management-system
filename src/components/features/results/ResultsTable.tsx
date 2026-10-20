"use client";

import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { SubmissionFileActions } from "@/components/shared/SubmissionFileActions";
import type { StaffGradingItem } from "@/types/results";
import {
  HiOutlineEyeOff,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineClock,
} from "react-icons/hi";

interface ResultsTableProps {
  items: StaffGradingItem[];
  isLoading: boolean;
  togglingId: string | null;
  emptyMessage: string;
  onGrade: (item: StaffGradingItem) => void;
  onTogglePublish: (item: StaffGradingItem) => void;
}

export function ResultsTable({
  items,
  isLoading,
  togglingId,
  emptyMessage,
  onGrade,
  onTogglePublish,
}: ResultsTableProps) {
  const columns: Column<StaffGradingItem>[] = [
    {
      key: "student",
      header: "Student",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{item.studentName}</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="font-mono">{item.studentId}</span>
            <span>&bull;</span>
            <span>{item.programmeCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: "assessment",
      header: "Assessment / Module",
      render: (item) => (
        <div className="flex flex-col max-w-xs">
          <div className="flex items-center gap-1.5">
            <Badge variant="info" size="sm">
              {item.moduleCode}
            </Badge>
            <span className="text-xs font-semibold text-slate-700 truncate">
              {item.moduleTitle}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-900 mt-1 truncate" title={item.assessmentTitle}>
            {item.assessmentTitle}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
            <span>v{item.latestVersionNumber}</span>
            <span>&bull;</span>
            <span className="truncate">{item.fileName}</span>
            {item.isLate && (
              <Badge variant="danger" size="sm">
                Late
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "grade",
      header: "Grade & Classification",
      render: (item) => {
        if (item.grade === null) {
          return (
            <Badge variant="neutral" size="sm">
              <span className="flex items-center gap-1 text-slate-500">
                <HiOutlineClock className="w-3.5 h-3.5" />
                Ungraded
              </span>
            </Badge>
          );
        }

        const badgeVariant =
          item.classification === "Distinction"
            ? "info"
            : item.classification === "Merit"
              ? "success"
              : item.classification === "Pass"
                ? "warning"
                : "danger";

        return (
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 font-mono">
              {item.grade}%
            </span>
            <Badge variant={badgeVariant} size="sm">
              {item.classification}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "publishStatus",
      header: "Publication Status",
      render: (item) => {
        if (item.grade === null) {
          return (
            <span className="text-xs text-slate-400 italic">
              Grade required to publish
            </span>
          );
        }

        return item.isPublished ? (
          <Badge variant="success" size="sm">
            <span className="flex items-center gap-1">
              <HiOutlineEye className="w-3.5 h-3.5 text-emerald-600" />
              Published
            </span>
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            <span className="flex items-center gap-1">
              <HiOutlineEyeOff className="w-3.5 h-3.5 text-amber-600" />
              Withheld (Draft)
            </span>
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => {
        const isTogglingThis = togglingId === item.submissionId;

        return (
          <div className="flex items-center justify-end gap-2.5">
            <SubmissionFileActions fileUrl={item.fileUrl} fileName={item.fileName} />

            <TableActionButton
              tooltip={item.grade !== null ? "Edit grade" : "Enter grade"}
              onClick={() => onGrade(item)}
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
            </TableActionButton>

            {item.grade !== null && (
              <TableActionButton
                tooltip={item.isPublished ? "Withhold result" : "Publish result"}
                onClick={() => onTogglePublish(item)}
                disabled={isTogglingThis}
                isLoading={isTogglingThis}
              >
                {item.isPublished ? (
                  <HiOutlineEyeOff className="w-4 h-4" />
                ) : (
                  <HiOutlineEye className="w-4 h-4" />
                )}
              </TableActionButton>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-visible">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="text-xs text-gray-500 mt-3 font-medium">
            Loading submissions and grades...
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}
