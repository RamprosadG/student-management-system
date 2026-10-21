"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Modal from "@/components/ui/modals/Modal";
import Pagination from "@/components/ui/pagination/Pagination";
import {
  UpdateStudentForm,
  StudentToEdit,
} from "@/features/students/UpdateStudentForm";
import { StudentsFilters } from "./StudentsFilters";
import { StudentsTable } from "./StudentsTable";
import type {
  ReferenceMeta,
  StaffStudentsFilters,
  StudentRecord,
} from "@/types/students";
import type { PaginationMeta } from "@/types/pagination";

interface StaffStudentsSectionProps {
  students: StudentRecord[];
  meta: ReferenceMeta;
  pagination: PaginationMeta | null;
  filters: StaffStudentsFilters;
  isLoading?: boolean;
}

export function StaffStudentsSection({
  students,
  meta,
  pagination,
  filters,
  isLoading = false,
}: StaffStudentsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Saved records refetch on their own transition so the registry keeps
  // showing rows while the form is still submitting.
  const [, startRefresh] = useTransition();
  const [editingStudent, setEditingStudent] = useState<StudentToEdit | null>(
    null
  );

  // Filter and page state lives in the URL, so the registry can be rendered on the server.
  const navigate = (changes: Partial<StaffStudentsFilters>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.programmeId) params.set("programmeId", next.programmeId);
    if (next.statusFilter) params.set("status", next.statusFilter);
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startRefresh(() => router.refresh());

  return (
    <>
      <StudentsFilters
        search={filters.search}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        selectedProgramme={filters.programmeId}
        onProgrammeChange={(value) => navigate({ programmeId: value, page: 1 })}
        selectedStatus={filters.statusFilter}
        onStatusChange={(value) => navigate({ statusFilter: value, page: 1 })}
        meta={meta}
      />
      <StudentsTable
        students={students}
        isLoading={isLoading || isPending}
        onEdit={setEditingStudent}
      />

      {pagination && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => navigate({ page })}
          total={pagination.total}
          limit={pagination.pageSize}
        />
      )}

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
              // Rows and KPI counters are both server reads, so refetch
              // instead of patching local state.
              refresh();
            }}
            onCancel={() => setEditingStudent(null)}
          />
        )}
      </Modal>
    </>
  );
}
