"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/buttons/Button";
import Modal from "@/components/ui/modals/Modal";
import { CreateAssessmentForm } from "@/features/assessments/CreateAssessmentForm";
import { HiRefresh, HiPlus } from "react-icons/hi";
import type { ModuleData } from "@/types/assessments";

interface AssessmentsActionsProps {
  modules: ModuleData[];
}

export function AssessmentsActions({ modules }: AssessmentsActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
        onClick={() => setIsCreateModalOpen(true)}
      >
        Create Assessment
      </Button>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assessment"
      >
        <CreateAssessmentForm
          modules={modules}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refresh();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </>
  );
}
