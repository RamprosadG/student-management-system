"use client";

import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/buttons/Button";
import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Modal from "@/components/ui/modals/Modal";
import StatCard from "@/components/ui/stats/StatCard";
import { useRole } from "@/components/shared/RoleContext";
import { SubmitAssessmentModal } from "@/features/assessments/SubmitAssessmentModal";
import {
  SubmissionHistoryModal,
  SubmissionVersionItem,
} from "@/features/assessments/SubmissionHistoryModal";
import { formatDate } from "@/lib/utils";
import {
  HiOutlineClipboardList,
  HiOutlineUpload,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiRefresh,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { FiClock } from "react-icons/fi";

interface StudentAssessmentItem {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  createdAt: string;
  module: {
    id: string;
    code: string;
    title: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
  };
  submission: {
    id: string;
    createdAt: string;
    updatedAt: string;
    latestVersionNumber: number;
    totalVersions: number;
    fileName: string;
    fileSize: number;
    storageKey: string;
    mimeType: string;
    submittedAt: string;
    isLate: boolean;
    lateDurationText: string | null;
    versions: SubmissionVersionItem[];
    result?: {
      id: string;
      grade: number;
      isPublished: boolean;
    } | null;
  } | null;
}

interface StudentInfo {
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
    id: string;
    name: string;
  };
}

export default function StudentAssessmentsPage() {
  const { selectedStudentId, studentList } = useRole();

  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [assessments, setAssessments] = useState<StudentAssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, SUBMITTED, LATE

  // Modals
  const [selectedAssessmentToSubmit, setSelectedAssessmentToSubmit] =
    useState<StudentAssessmentItem | null>(null);
  const [historyAssessment, setHistoryAssessment] =
    useState<StudentAssessmentItem | null>(null);

  const fetchStudentAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStudentId) {
        params.append("studentId", selectedStudentId);
      }
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`/api/submissions?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setStudentInfo(json.data.student || null);
        setAssessments(json.data.assessments || []);
      }
    } catch (err) {
      console.error("Failed to fetch student assessments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId, search]);

  useEffect(() => {
    fetchStudentAssessments();
  }, [fetchStudentAssessments]);

  // Summary Metrics
  const totalAssessments = assessments.length;
  const submittedCount = assessments.filter((a) => a.submission !== null).length;
  const pendingCount = totalAssessments - submittedCount;
  const overdueCount = assessments.filter(
    (a) => a.isPastDeadline && a.submission === null
  ).length;

  // Filtered List
  const filteredAssessments = assessments.filter((item) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return item.submission === null;
    if (statusFilter === "SUBMITTED") return item.submission !== null;
    if (statusFilter === "LATE") {
      return item.submission?.isLate || (item.isPastDeadline && !item.submission);
    }
    return true;
  });

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

  const statusDropdownOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "PENDING", label: "Pending Submission" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "LATE", label: "Overdue / Late" },
  ];

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
      render: (item) => {
        return (
          <div className="flex flex-col">
            <span
              className={`text-xs font-semibold ${
                item.isPastDeadline ? "text-red-600" : "text-slate-800"
              }`}
            >
              {formatDateTime(item.deadline)}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5">
              {item.isPastDeadline ? "Deadline passed" : "Accepting submissions"}
            </span>
          </div>
        );
      },
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
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          {item.submission && item.submission.versions.length > 0 && (
            <button
              onClick={() => setHistoryAssessment(item)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-300 rounded-lg px-2.5 py-1.5 transition-all shadow-2xs cursor-pointer"
              title="View Version History"
            >
              <FiClock className="w-3.5 h-3.5 text-slate-400" />
              <span>History ({item.submission.totalVersions})</span>
            </button>
          )}

          <Button
            size="sm"
            variant={item.submission ? "secondary-outline" : "primary"}
            onClick={() => setSelectedAssessmentToSubmit(item)}
          >
            <span className="flex items-center gap-1.5">
              <HiOutlineUpload className="w-3.5 h-3.5" />
              {item.submission ? "Resubmit" : "Submit Work"}
            </span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Student Information Header */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/40 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                Student Portal
              </span>
              <span className="text-xs font-mono text-slate-500">
                {studentInfo?.studentId || "SMS-STUDENT"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Assessment Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {studentInfo
                ? `${studentInfo.fullName} • ${studentInfo.programme.name} (${studentInfo.academicYear.name})`
                : "Submit assignments, inspect version history, and upload revisions before deadlines."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="white"
              size="md"
              icon={<HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              onClick={fetchStudentAssessments}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assigned"
          value={totalAssessments}
          subtitle="In your enrolled programme"
          icon={<HiOutlineClipboardList className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Submitted"
          value={submittedCount}
          subtitle="Assessments handed in"
          icon={<HiOutlineCheckCircle className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Pending Action"
          value={pendingCount}
          subtitle="Awaiting your submission"
          icon={<HiOutlineClock className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          subtitle="Past deadline & unsubmitted"
          icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input takes all remaining space */}
        <div className="flex-1 w-full min-w-0">
          <SearchInput
            value={search}
            onDebouncedChange={(val) => setSearch(val)}
            placeholder="Search by assessment or module..."
          />
        </div>

        <div className="w-full sm:w-60 shrink-0">
          <Dropdown
            options={statusDropdownOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Filter Status"
          />
        </div>
      </div>

      {/* Assessment Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
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
            data={filteredAssessments}
            emptyMessage={
              search || statusFilter !== "ALL"
                ? "No assessments match the current filters."
                : "No assessments currently assigned to your enrolled programme."
            }
          />
        )}
      </div>

      {/* Modal: Submit Assessment Dropzone */}
      <Modal
        isOpen={Boolean(selectedAssessmentToSubmit)}
        onClose={() => setSelectedAssessmentToSubmit(null)}
        title={
          selectedAssessmentToSubmit?.submission
            ? `Resubmit Work: ${selectedAssessmentToSubmit.title}`
            : `Submit Assessment: ${selectedAssessmentToSubmit?.title || ""}`
        }
      >
        {selectedAssessmentToSubmit && studentInfo && (
          <SubmitAssessmentModal
            assessment={selectedAssessmentToSubmit}
            studentId={studentInfo.id}
            studentName={studentInfo.fullName}
            onSuccess={() => {
              setSelectedAssessmentToSubmit(null);
              fetchStudentAssessments();
            }}
            onClose={() => setSelectedAssessmentToSubmit(null)}
          />
        )}
      </Modal>

      {/* Modal: Submission Version History */}
      <Modal
        isOpen={Boolean(historyAssessment)}
        onClose={() => setHistoryAssessment(null)}
        title="Submission Version Audit History"
      >
        {historyAssessment && historyAssessment.submission && (
          <SubmissionHistoryModal
            assessment={{
              title: historyAssessment.title,
              deadline: historyAssessment.deadline,
              module: {
                code: historyAssessment.module.code,
                title: historyAssessment.module.title,
              },
            }}
            versions={historyAssessment.submission.versions}
            onClose={() => setHistoryAssessment(null)}
          />
        )}
      </Modal>
    </div>
  );
}
