"use client";

import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/buttons/Button";
import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Modal from "@/components/ui/modals/Modal";
import StatCard from "@/components/ui/stats/StatCard";
import { CreateAssessmentForm } from "@/features/assessments/CreateAssessmentForm";
import {
  SubmissionInspectorModal,
  SubmissionItem,
} from "@/features/assessments/SubmissionInspectorModal";
import { formatDate } from "@/lib/utils";
import {
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiRefresh,
  HiPlus,
  HiOutlineEye,
} from "react-icons/hi";

interface ModuleData {
  id: string;
  code: string;
  title: string;
  programme: {
    id: string;
    code: string;
    name: string;
  };
}

interface AssessmentItem {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  createdAt: string;
  module: ModuleData;
  stats: {
    totalSubmissions: number;
    onTimeSubmissionsCount: number;
    lateSubmissionsCount: number;
  };
  submissions: SubmissionItem[];
}

interface AssessmentSummary {
  totalAssessments: number;
  totalSubmissions: number;
  totalLateSubmissions: number;
}

export default function StaffAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [summary, setSummary] = useState<AssessmentSummary>({
    totalAssessments: 0,
    totalSubmissions: 0,
    totalLateSubmissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inspectedAssessment, setInspectedAssessment] = useState<AssessmentItem | null>(null);

  // Fetch Module Reference Options
  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch("/api/assessments?modules=true");
      const data = await res.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch modules", err);
    }
  }, []);

  // Fetch Assessments
  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedModuleId && selectedModuleId !== "ALL") {
        params.set("moduleId", selectedModuleId);
      }

      const res = await fetch(`/api/assessments?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setAssessments(data.data.assessments);
        setSummary(data.data.summary);
      }
    } catch (err) {
      console.error("Failed to load assessments", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedModuleId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Format date and time
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

  // Module filter dropdown options
  const moduleFilterOptions = [
    { value: "ALL", label: "All Modules" },
    ...modules.map((m) => ({
      value: m.id,
      label: `${m.code} - ${m.title}`,
    })),
  ];

  // Table Columns
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
        <div className="relative inline-block group">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInspectedAssessment(item);
            }}
            className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-200 cursor-pointer"
            aria-label="Inspect submissions"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            <div className="rounded-md bg-slate-900 text-white text-[11px] font-medium px-2 py-1 shadow-md whitespace-nowrap">
              Inspect Submissions
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Assessments & Submissions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create module assessments, manage deadlines, and inspect student delivery timestamps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="white"
            size="md"
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={() => fetchAssessments()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<HiPlus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Assessments"
          value={summary.totalAssessments}
          subtitle="Across all curriculum modules"
          icon={<HiOutlineClipboardList className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Total Submissions"
          value={summary.totalSubmissions}
          subtitle="Student uploads received"
          icon={<HiOutlineDocumentText className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Late Submissions"
          value={summary.totalLateSubmissions}
          subtitle="Past assessment deadline"
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
            placeholder="Search assessment title or module code/name..."
          />
        </div>

        <div className="w-full sm:w-60 shrink-0">
          <Dropdown
            options={moduleFilterOptions}
            value={selectedModuleId}
            onChange={(val) => setSelectedModuleId(val)}
            placeholder="Filter by Module"
          />
        </div>
      </div>

      {/* Assessment Table */}
      <DataTable
        data={assessments}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No assessments found. Click 'Create Assessment' to publish your first one."
      />

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assessment"
      >
        <CreateAssessmentForm
          modules={modules}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchAssessments();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Submission Inspector Modal */}
      <Modal
        isOpen={Boolean(inspectedAssessment)}
        onClose={() => setInspectedAssessment(null)}
        title="Submission Inspector"
        className="max-w-3xl"
      >
        {inspectedAssessment && (
          <SubmissionInspectorModal
            assessment={inspectedAssessment}
            submissions={inspectedAssessment.submissions}
            onClose={() => setInspectedAssessment(null)}
          />
        )}
      </Modal>
    </div>
  );
}
