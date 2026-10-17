"use client";

import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/buttons/Button";
import SearchInput from "@/components/ui/inputs/SearchInput";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Modal from "@/components/ui/modals/Modal";
import { CreateStudentForm } from "@/features/students/CreateStudentForm";
import {
  UpdateStudentForm,
  StudentToEdit,
} from "@/features/students/UpdateStudentForm";
import { HiPlus, HiRefresh } from "react-icons/hi";
import { FiEdit } from "react-icons/fi";
import { formatDate, formatCurrency } from "@/lib/utils";

interface StudentRecord {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  status: "ENROLLED" | "DEFERRED" | "WITHDRAWN" | "COMPLETED";
  createdAt: string;
  programme: {
    id: string;
    code: string;
    name: string;
    standardFee: number;
  };
  academicYear: {
    id: string;
    name: string;
  };
  studentFee?: {
    id: string;
    amountDue: number;
    dueDate: string;
  } | null;
}

interface ReferenceMeta {
  programmes: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string }>;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [meta, setMeta] = useState<ReferenceMeta>({ programmes: [], academicYears: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchReferenceData = async () => {
    try {
      const res = await fetch("/api/students?meta=true");
      const data = await res.json();
      if (data.success && data.data) {
        setMeta(data.data);
      }
    } catch (e) {
      console.error("Failed to load reference data", e);
    }
  };

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedProgramme) params.set("programmeId", selectedProgramme);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/students?${params.toString()}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setStudents(result.data);
      }
    } catch (e) {
      console.error("Failed to load students", e);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedProgramme, selectedStatus]);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const statusVariantMap = {
    ENROLLED: "success",
    DEFERRED: "warning",
    WITHDRAWN: "danger",
    COMPLETED: "info",
  } as const;

  const programmeFilterOptions = [
    { value: "", label: "All Programmes" },
    ...meta.programmes.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.code})`,
    })),
  ];

  const statusFilterOptions = [
    { value: "", label: "All Statuses" },
    { value: "ENROLLED", label: "Enrolled" },
    { value: "DEFERRED", label: "Deferred" },
    { value: "WITHDRAWN", label: "Withdrawn" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const columns: Column<StudentRecord>[] = [
    {
      key: "studentId",
      header: "Student ID",
      render: (item) => (
        <span className="font-mono font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md text-xs border border-indigo-100">
          {item.studentId}
        </span>
      ),
    },
    {
      key: "fullName",
      header: "Student Details",
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.fullName}</div>
          <div className="text-xs text-gray-500">{item.email}</div>
        </div>
      ),
    },
    {
      key: "programme",
      header: "Programme",
      render: (item) => (
        <div>
          <div className="font-medium text-slate-800">{item.programme?.name}</div>
          <div className="text-xs text-gray-500">
            Year: {item.academicYear?.name} &middot; Standard Fee:{" "}
            {item.programme ? formatCurrency(Number(item.programme.standardFee)) : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "dateOfBirth",
      header: "Date of Birth",
      render: (item) => (
        <span className="text-gray-600 text-xs">
          {formatDate(item.dateOfBirth)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Enrolment Status",
      render: (item) => (
        <Badge variant={statusVariantMap[item.status]} size="md">
          {item.status.toLowerCase()}
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
              setEditingStudent({
                id: item.id,
                studentId: item.studentId,
                fullName: item.fullName,
                email: item.email,
                dateOfBirth: item.dateOfBirth,
                status: item.status,
              });
            }}
            className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-200 cursor-pointer"
            aria-label="Edit student"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            <div className="rounded-md bg-slate-900 text-white text-[11px] font-medium px-2 py-1 shadow-md whitespace-nowrap">
              Edit
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [editingStudent, setEditingStudent] = useState<StudentToEdit | null>(null);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Enrol Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Enrolment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add and manage student registry records, filter cohorts, and track statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="white"
            size="md"
            icon={<HiRefresh className="w-4 h-4" />}
            onClick={() => fetchStudents()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<HiPlus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Enrol Student
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input takes all remaining space */}
        <div className="flex-1 w-full min-w-0">
          <SearchInput
            value={search}
            onDebouncedChange={(val) => setSearch(val)}
            placeholder="Search by name, ID or email..."
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <div className="w-full sm:w-64">
            <Dropdown
              options={programmeFilterOptions}
              value={selectedProgramme}
              onChange={(val) => setSelectedProgramme(val)}
              placeholder="Filter by Programme"
            />
          </div>

          <div className="w-full sm:w-48">
            <Dropdown
              options={statusFilterOptions}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              placeholder="Filter Status"
            />
          </div>
        </div>
      </div>

      {/* Student Records Data Table */}
      <DataTable
        data={students}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No students found matching your filters."
      />

      {/* Enrol Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enrol New Student"
      >
        <CreateStudentForm
          programmes={meta.programmes}
          academicYears={meta.academicYears}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchStudents();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Update Student Status/Details Modal */}
      <Modal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        title="Update Student"
      >
        {editingStudent && (
          <UpdateStudentForm
            student={editingStudent}
            onSuccess={() => {
              setEditingStudent(null);
              fetchStudents();
            }}
            onCancel={() => setEditingStudent(null)}
          />
        )}
      </Modal>
    </div>
  );
}


