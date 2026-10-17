"use client";

import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/buttons/Button";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import StatCard from "@/components/ui/stats/StatCard";
import { useRole } from "@/components/shared/RoleContext";
import { formatDate } from "@/lib/utils";
import {
  HiOutlineDocumentReport,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiRefresh,
  HiOutlineInformationCircle,
  HiOutlineClock,
} from "react-icons/hi";

interface StudentMarksheetItem {
  id: string;
  assessmentTitle: string;
  moduleCode: string;
  moduleTitle: string;
  deadline: string;
  submission: {
    id: string;
    fileName: string;
    submittedAt: string;
    isLate: boolean;
    versionNumber: number;
  } | null;
  result: {
    id: string;
    grade: number;
    classification: "Distinction" | "Merit" | "Pass" | "Fail";
    gradedAt: string;
  } | null;
  hasSubmission: boolean;
  statusText: string;
}

interface MarksheetResponse {
  student: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
    academicYear: {
      name: string;
    };
  } | null;
  marksheet: StudentMarksheetItem[];
  stats: {
    totalAssessments: number;
    publishedResultsCount: number;
    withheldOrPendingCount: number;
    averageGrade: number | null;
    overallClassification: "Distinction" | "Merit" | "Pass" | "Fail" | null;
  };
}

export default function MarksheetPage() {
  const { selectedStudentId } = useRole();

  const [data, setData] = useState<MarksheetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarksheet = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("view", "student");
      if (selectedStudentId) {
        params.append("studentId", selectedStudentId);
      }

      const res = await fetch(`/api/results?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch student marksheet:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchMarksheet();
  }, [fetchMarksheet]);

  const student = data?.student;
  const marksheet = data?.marksheet || [];
  const stats = data?.stats || {
    totalAssessments: 0,
    publishedResultsCount: 0,
    withheldOrPendingCount: 0,
    averageGrade: null,
    overallClassification: null,
  };

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
    <div className="space-y-6">
      {/* Official Marksheet Header Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/40 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                Official Registry Marksheet
              </span>
              <span className="text-xs font-mono text-slate-500">
                {student?.studentId || "SMS-STUDENT"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Academic Transcript & Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {student
                ? `${student.fullName} • ${student.programme.name} (${student.academicYear.name})`
                : "Official published grades and classifications certified by the Registry."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="white"
              size="md"
              icon={<HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              onClick={fetchMarksheet}
              disabled={isLoading}
            >
              Refresh Marksheet
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Published Results"
          value={stats.publishedResultsCount}
          icon={<HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />}
          subtitle={`Out of ${stats.totalAssessments} assessments`}
        />
        <StatCard
          title="Average Score"
          value={stats.averageGrade !== null ? `${stats.averageGrade}%` : "N/A"}
          icon={<HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />}
          subtitle="Across published modules"
        />
        <StatCard
          title="Current Classification"
          value={stats.overallClassification || "Pending"}
          icon={<HiOutlineDocumentReport className="w-5 h-5 text-blue-600" />}
          subtitle="Based on published grades"
        />
        <StatCard
          title="Withheld / Pending"
          value={stats.withheldOrPendingCount}
          icon={<HiOutlineLockClosed className="w-5 h-5 text-amber-600" />}
          subtitle="Not yet certified for release"
        />
      </div>

      {/* Information Banner regarding Registry Policy */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex items-start gap-3">
        <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 space-y-1">
          <span className="font-semibold block">Academic Publication Policy</span>
          <p>
            Grades are visible on your official marksheet only after formal verification and release by the Registry Office. Draft grades under review or results withheld for administrative checks will remain masked until formally published.
          </p>
        </div>
      </div>

      {/* Transcript Table */}
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
            emptyMessage="No enrolled assessments found for your programme."
          />
        )}
      </div>
    </div>
  );
}
