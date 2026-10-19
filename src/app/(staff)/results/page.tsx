"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/buttons/Button";
import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Modal from "@/components/ui/modals/Modal";
import StatCard from "@/components/ui/stats/StatCard";
import { GradeEntryModal } from "@/features/results/GradeEntryModal";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import {
  HiOutlineDocumentReport,
  HiOutlineCheckCircle,
  HiOutlineEyeOff,
  HiOutlineEye,
  HiRefresh,
  HiOutlinePencilAlt,
  HiOutlineClock,
} from "react-icons/hi";
import { string } from "zod";

interface StaffGradingItem {
  id: string; // alias for submissionId to satisfy DataTable
  submissionId: string;
  studentId: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  assessmentId: string;
  assessmentTitle: string;
  deadline: string;
  moduleCode: string;
  moduleTitle: string;
  programmeCode: string;
  programmeName: string;
  fileName: string;
  fileSize: number;
  submittedAt: string;
  versionCount: number;
  latestVersionNumber: number;
  isLate: boolean;
  lateDurationText: string | null;
  resultId: string | null;
  grade: number | null;
  classification: "Distinction" | "Merit" | "Pass" | "Fail" | null;
  isPublished: boolean;
  gradedAt: string | null;
}

interface ModuleItem {
  id: string;
  code: string;
  title: string;
  programme?: { code: string; name: string };
}

export default function StaffResultsPage() {
  const [items, setItems] = useState<StaffGradingItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [publishFilter, setPublishFilter] = useState<"ALL" | "PUBLISHED" | "WITHHELD" | "UNGRADED">("ALL");

  // Selected for grade entry modal
  const [gradingSubmission, setGradingSubmission] = useState<StaffGradingItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch("/api/modules");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setModules(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch modules:", err);
    }
  }, []);

  const fetchGradingList = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedModule !== "ALL") params.append("moduleId", selectedModule);
      if (publishFilter !== "ALL") params.append("publishStatus", publishFilter);

      const res = await fetch(`/api/results?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setItems(
          json.data.map((item: any) => ({
            ...item,
            id: item.submissionId,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch grading items:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedModule, publishFilter]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    fetchGradingList();
  }, [fetchGradingList]);

  // Handle Quick Publish / Withhold Toggle
  const handleTogglePublish = async (item: StaffGradingItem) => {
    if (item.grade === null) {
      showErrorAlert("Cannot publish an ungraded submission. Please record a grade first.");
      return;
    }

    setTogglingId(item.submissionId);
    try {
      const nextState = !item.isPublished;
      const res = await fetch("/api/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: item.submissionId,
          isPublished: nextState,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update publication status");
      }

      showSuccessAlert(
        nextState
          ? "Grade published to student marksheet"
          : "Grade withheld from student view"
      );

      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.submissionId === item.submissionId
            ? { ...i, isPublished: nextState }
            : i
        )
      );
    } catch (err: any) {
      showErrorAlert(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  // KPI Metrics
  const totalSubmissions = items.length;
  const gradedCount = items.filter((i) => i.grade !== null).length;
  const publishedCount = items.filter((i) => i.isPublished).length;
  const withheldCount = gradedCount - publishedCount;

  const moduleDropdownOptions = [
    { value: "ALL", label: "All Modules" },
    ...modules.map((m) => ({
      value: m.id,
      label: m.programme?.code
        ? `${m.code} - ${m.title} (${m.programme.code})`
        : `${m.code} - ${m.title}`,
    })),
  ];

  const publishFilterOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "PUBLISHED", label: "Published" },
    { value: "WITHHELD", label: "Withheld (Draft)" },
    { value: "UNGRADED", label: "Pending Grading" },
  ];

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
          <div className="flex items-center justify-end gap-1.5">
            <TableActionButton
              tooltip={item.grade !== null ? "Edit grade" : "Enter grade"}
              onClick={() => setGradingSubmission(item)}
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
            </TableActionButton>

            {item.grade !== null && (
              <TableActionButton
                tooltip={item.isPublished ? "Withhold result" : "Publish result"}
                onClick={() => handleTogglePublish(item)}
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
    <div className="flex flex-col gap-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Marksheet & Results Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter assessment grades (0–100), apply academic classifications, and manage publish/withhold controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary-outline"
            size="md"
            icon={<HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
            onClick={fetchGradingList}
            disabled={isLoading}
          >
            Refresh Ledger
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          subtitle="Work submitted by students"
          icon={<HiOutlineDocumentReport className="w-6 h-6" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50/50"
          borderColor="border-indigo-200"
        />

        <StatCard
          title="Evaluated / Graded"
          value={gradedCount}
          subtitle={`${totalSubmissions - gradedCount} awaiting score`}
          icon={<HiOutlineCheckCircle className="w-6 h-6" />}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50/50"
          borderColor="border-emerald-200"
        />

        <StatCard
          title="Published to Students"
          value={publishedCount}
          subtitle="Live on student marksheet"
          icon={<HiOutlineEye className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          bgColor="bg-blue-50/50"
          borderColor="border-blue-200"
        />

        <StatCard
          title="Withheld / Draft"
          value={withheldCount}
          subtitle="Internal review only"
          icon={<HiOutlineEyeOff className="w-6 h-6" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          bgColor="bg-amber-50/50"
          borderColor="border-amber-200"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
        {/* Search Input takes all remaining space */}
        <div className="flex-1 w-full min-w-0">
          <SearchInput
            value={search}
            onDebouncedChange={(val) => setSearch(val)}
            placeholder="Search by student, ID, or assessment..."
          />
        </div>

        <div className="w-full sm:w-60 shrink-0">
          <Dropdown
            options={moduleDropdownOptions}
            value={selectedModule}
            onChange={(val) => setSelectedModule(val)}
            placeholder="Filter by Module"
          />
        </div>

        <div className="w-full sm:w-52 shrink-0">
          <Dropdown
            options={publishFilterOptions}
            value={publishFilter}
            onChange={(val) => setPublishFilter(val as any)}
            placeholder="Filter Publication Status"
          />
        </div>
      </div>

      {/* Grading Ledger Table */}
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
            emptyMessage={
              search || selectedModule !== "ALL" || publishFilter !== "ALL"
                ? "No submission records match your filter criteria."
                : "No student submissions recorded yet. Students can submit work in the Student Portal."
            }
          />
        )}
      </div>

      {/* Grade Entry Modal */}
      <Modal
        isOpen={Boolean(gradingSubmission)}
        onClose={() => setGradingSubmission(null)}
        title={
          gradingSubmission?.grade !== null
            ? `Update Grade: ${gradingSubmission?.studentName || ""}`
            : `Enter Grade: ${gradingSubmission?.studentName || ""}`
        }
      >
        {gradingSubmission && (
          <GradeEntryModal
            submission={gradingSubmission}
            onSuccess={() => {
              setGradingSubmission(null);
              fetchGradingList();
            }}
            onClose={() => setGradingSubmission(null)}
          />
        )}
      </Modal>
    </div>
  );
}
