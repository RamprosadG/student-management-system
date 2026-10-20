"use client";

import React from "react";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Badge from "@/components/ui/badges/Badge";
import Button from "@/components/ui/buttons/Button";
import { TableActionLink } from "@/components/ui/buttons/TableActionButton";
import { SubmissionFileActions } from "@/components/shared/SubmissionFileActions";
import { HiOutlineClock, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlinePencilAlt } from "react-icons/hi";

export interface SubmissionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  versionCount: number;
  latestVersionNumber: number;
  fileName: string;
  fileSize: number;
  fileUrl: string | null;
  submittedAt: string;
  isLate: boolean;
  lateDurationText: string | null;
  result?: {
    id: string;
    grade: number;
    isPublished: boolean;
  } | null;
}

interface AssessmentInfo {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  module: {
    code: string;
    title: string;
    programme: {
      code: string;
      name: string;
    };
  };
}

interface SubmissionInspectorModalProps {
  assessment: AssessmentInfo;
  submissions: SubmissionItem[];
  onClose: () => void;
}

export function SubmissionInspectorModal({
  assessment,
  submissions,
  onClose,
}: SubmissionInspectorModalProps) {
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const columns: Column<SubmissionItem>[] = [
    {
      key: "student",
      header: "Student",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{item.studentName}</span>
          <span className="text-xs text-gray-500 font-mono">
            {item.studentId} • {item.studentEmail}
          </span>
        </div>
      ),
    },
    {
      key: "version",
      header: "Version",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="neutral" size="sm">
            v{item.latestVersionNumber}
          </Badge>
          {item.versionCount > 1 && (
            <span className="text-[11px] text-gray-400">
              ({item.versionCount} revisions)
            </span>
          )}
        </div>
      ),
    },
    {
      key: "file",
      header: "Submitted File",
      render: (item) => (
        <div className="flex items-center gap-2">
          <HiOutlineDocumentText className="w-4 h-4 text-indigo-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-800 truncate max-w-[180px]">
              {item.fileName}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatFileSize(item.fileSize)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: "Submission Time",
      render: (item) => (
        <span className="text-xs text-gray-600 font-mono">
          {formatDateTime(item.submittedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Delivery Status",
      render: (item) =>
        item.isLate ? (
          <div className="flex flex-col gap-0.5">
            <Badge variant="danger" size="md">
              Late
            </Badge>
            {item.lateDurationText && (
              <span className="text-[11px] font-medium text-rose-600">
                {item.lateDurationText}
              </span>
            )}
          </div>
        ) : (
          <Badge variant="success" size="md">
            On Time
          </Badge>
        ),
    },
    {
      key: "grade",
      header: "Grading",
      render: (item) =>
        item.result ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">
              {item.result.grade}/100
            </span>
            <Badge
              variant={item.result.isPublished ? "info" : "neutral"}
              size="sm"
            >
              {item.result.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Ungraded</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2.5">
          <SubmissionFileActions fileUrl={item.fileUrl} fileName={item.fileName} />
          <TableActionLink
            href="/results"
            tooltip={item.result ? "Review grade" : "Enter grade"}
          >
            <HiOutlinePencilAlt className="w-4 h-4" />
          </TableActionLink>
        </div>
      ),
    },
  ];

  const onTimeCount = submissions.filter((s) => !s.isLate).length;
  const lateCount = submissions.filter((s) => s.isLate).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Assessment Header Info Card */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info" size="sm">
              {assessment.module.code}
            </Badge>
            <span className="text-xs font-medium text-slate-600">
              {assessment.module.title}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">{assessment.title}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
            <HiOutlineClock className="w-3.5 h-3.5 text-gray-400" />
            <span>Deadline: {formatDateTime(assessment.deadline)}</span>
            {assessment.isPastDeadline && (
              <span className="text-rose-600 font-semibold ml-1">(Closed)</span>
            )}
          </div>
        </div>

        {/* Quick Delivery Summary Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5">
            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              {onTimeCount} On Time
            </span>
          </div>
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5">
            <HiOutlineExclamation className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-semibold text-rose-700">
              {lateCount} Late
            </span>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="max-h-[420px] overflow-y-auto">
        <DataTable
          data={submissions}
          columns={columns}
          isLoading={false}
          emptyMessage="No student submissions have been uploaded for this assessment yet."
        />
      </div>

      {/* Modal Footer */}
      <div className="pt-4 border-t border-gray-100 flex justify-end w-full">
        <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Close Inspector
        </Button>
      </div>
    </div>
  );
}
