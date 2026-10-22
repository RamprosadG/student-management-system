"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/buttons/Button";
import Modal from "@/components/ui/modals/Modal";
import { CreateStudentForm } from "@/features/students/CreateStudentForm";
import { HiPlus, HiRefresh } from "react-icons/hi";
import type { ReferenceMeta } from "@/types/students";

interface StudentsActionsProps {
  meta: ReferenceMeta;
}

export function StudentsActions({ meta }: StudentsActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);

  const refresh = () => startTransition(() => router.refresh());

  return (
    <>
      <Button
        variant="secondary"
        size="md"
        className="max-sm:text-xs max-sm:px-2 max-sm:gap-1.5"
        icon={<HiRefresh className="w-4 h-4" />}
        onClick={refresh}
        disabled={isPending}
      >
        Refresh
      </Button>
      <Button
        variant="primary"
        size="md"
        className="max-sm:text-xs max-sm:px-2 max-sm:gap-1.5"
        icon={<HiPlus className="w-4 h-4" />}
        onClick={() => setIsEnrolModalOpen(true)}
      >
        Enrol Student
      </Button>

      <Modal
        isOpen={isEnrolModalOpen}
        onClose={() => setIsEnrolModalOpen(false)}
        title="Enrol New Student"
      >
        <CreateStudentForm
          programmes={meta.programmes}
          academicYears={meta.academicYears}
          onSuccess={() => {
            setIsEnrolModalOpen(false);
            // Registry rows and KPI counters are both server reads.
            refresh();
          }}
          onCancel={() => setIsEnrolModalOpen(false)}
        />
      </Modal>
    </>
  );
}
