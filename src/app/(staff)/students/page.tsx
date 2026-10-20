"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/ui/modals/Modal";
import { CreateStudentForm } from "@/features/students/CreateStudentForm";
import {
  UpdateStudentForm,
  StudentToEdit,
} from "@/features/students/UpdateStudentForm";
import { StudentsHeader } from "@/components/features/students/StudentsHeader";
import { StudentsFilters } from "@/components/features/students/StudentsFilters";
import { StudentsTable } from "@/components/features/students/StudentsTable";
import type { StudentRecord, ReferenceMeta } from "@/types/students";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [meta, setMeta] = useState<ReferenceMeta>({ programmes: [], academicYears: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedProgramme, setSelectedProgramme] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [editingStudent, setEditingStudent] = useState<StudentToEdit | null>(null);

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

  return (
    <div className="flex flex-col gap-6 w-full">
      <StudentsHeader
        onRefresh={() => fetchStudents()}
        onEnrol={() => setIsModalOpen(true)}
      />
      <StudentsFilters
        search={search}
        onSearchChange={setSearch}
        selectedProgramme={selectedProgramme}
        onProgrammeChange={setSelectedProgramme}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        meta={meta}
      />
      <StudentsTable
        students={students}
        isLoading={isLoading}
        onEdit={setEditingStudent}
      />

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
