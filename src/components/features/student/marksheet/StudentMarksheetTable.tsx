import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import { formatDate } from "@/lib/utils";
import type { StudentMarksheetItem } from "@/types/results";
import { HiOutlineLockClosed, HiOutlineClock } from "react-icons/hi";

interface StudentMarksheetTableProps {
  marksheet: StudentMarksheetItem[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function StudentMarksheetTable({
  marksheet,
  isLoading,
  emptyMessage = "No enrolled assessments found for your programme.",
}: StudentMarksheetTableProps) {
  const columns: Column<StudentMarksheetItem>[] = [
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
      header: "Assessment",
      render: (item) => (
        <div className="flex flex-col max-w-sm">
          <span className="text-sm font-medium text-slate-900">{item.assessmentTitle}</span>
          <span className="text-xs text-gray-400 mt-0.5">
            Deadline: {formatDate(item.deadline)}
          </span>
        </div>
      ),
    },
    {
      key: "submission",
      header: "Submission",
      render: (item) => {
        if (!item.submission) {
          return (
            <span className="text-xs text-slate-400 italic">No submission</span>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
              {item.submission.fileName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-indigo-600 font-semibold">
                v{item.submission.versionNumber}
              </span>
              {item.submission.isLate && (
                <Badge variant="danger" size="sm">
                  Late
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "grade",
      header: "Official Grade",
      render: (item) => {
        if (item.result) {
          return (
            <span className="text-base font-bold text-slate-900 font-mono">
              {item.result.grade}%
            </span>
          );
        }

        return (
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            &mdash;
          </span>
        );
      },
    },
    {
      key: "classification",
      header: "Classification / Status",
      render: (item) => {
        if (item.result) {
          const badgeVariant =
            item.result.classification === "Distinction"
              ? "info"
              : item.result.classification === "Merit"
                ? "success"
                : item.result.classification === "Pass"
                  ? "warning"
                  : "danger";

          return (
            <Badge variant={badgeVariant} size="sm">
              {item.result.classification}
            </Badge>
          );
        }

        // Distinct friendly feedback for withheld vs pending
        if (item.statusText.includes("Withheld")) {
          return (
            <Badge variant="warning" size="sm">
              <span className="flex items-center gap-1">
                <HiOutlineLockClosed className="w-3.5 h-3.5 text-amber-600" />
                Withheld by Registry
              </span>
            </Badge>
          );
        }

        if (item.statusText.includes("Awaiting")) {
          return (
            <Badge variant="neutral" size="sm">
              <span className="flex items-center gap-1 text-slate-500">
                <HiOutlineClock className="w-3.5 h-3.5" />
                Awaiting Evaluation
              </span>
            </Badge>
          );
        }

        return (
          <Badge variant="neutral" size="sm">
            <span className="text-slate-400">Pending</span>
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="text-xs text-gray-500 mt-3 font-medium">
            Loading official transcript...
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={marksheet}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}
