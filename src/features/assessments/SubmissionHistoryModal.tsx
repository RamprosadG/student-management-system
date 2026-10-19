"use client";

import React from "react";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Badge from "@/components/ui/badges/Badge";
import Button from "@/components/ui/buttons/Button";
import { formatDate } from "@/lib/utils";
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
} from "react-icons/hi";

export interface SubmissionVersionItem {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  submittedAt: string;
  isLate: boolean;
}

interface AssessmentVersionInfo {
  title: string;
  deadline: string;
  module: {
    code: string;
    title: string;
  };
}

interface SubmissionHistoryModalProps {
  assessment: AssessmentVersionInfo;
  versions: SubmissionVersionItem[];
  onClose: () => void;
}

export function SubmissionHistoryModal({
  assessment,
  versions,
  onClose,
}: SubmissionHistoryModalProps) {
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
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns: Column<SubmissionVersionItem>[] = [
    {
      key: "version",
      header: "Version",
      render: (v) => (
        <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700">
          v{v.versionNumber}
        </span>
      ),
    },
    {
      key: "fileName",
      header: "File Name",
      render: (v) => (
        <div className="flex items-center gap-2 max-w-xs truncate">
          <HiOutlineDocumentText className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-medium text-slate-800 truncate" title={v.fileName}>
            {v.fileName}
          </span>
        </div>
      ),
    },
    {
      key: "fileSize",
      header: "Size",
      render: (v) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatFileSize(v.fileSize)}
        </span>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted At",
      render: (v) => (
        <span className="text-xs text-slate-700">
          {formatDateTime(v.submittedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Punctuality",
      render: (v) =>
        v.isLate ? (
          <Badge variant="danger" size="sm">
            <span className="flex items-center gap-1">
              <HiOutlineExclamation className="w-3.5 h-3.5 text-red-500" />
              Late
            </span>
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            <span className="flex items-center gap-1">
              <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              On Time
            </span>
          </Badge>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Overview Card */}
      <div className="rounded-xl border border-gray-100 bg-slate-50 p-4 space-y-1">
        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
          {assessment.module.code} - {assessment.module.title}
        </span>
        <h3 className="text-base font-bold text-slate-900">{assessment.title}</h3>
        <p className="text-xs text-slate-500">
          Deadline: {formatDateTime(assessment.deadline)} &bull; Total Submissions: {versions.length}
        </p>
      </div>

      {/* Version Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={versions}
          emptyMessage="No versions found"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
