"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/modals/Modal";
import { RecordPaymentForm, FeeAccountItem } from "@/features/fees/RecordPaymentForm";
import { OverdueAccountsPanel } from "./OverdueAccountsPanel";
import type { PriorityOverdueStudent } from "@/types/staff-dashboard";

interface StaffOverdueAccountsSectionProps {
  students: PriorityOverdueStudent[];
}

export function StaffOverdueAccountsSection({
  students,
}: StaffOverdueAccountsSectionProps) {
  const router = useRouter();
  const [selectedFeeForPayment, setSelectedFeeForPayment] =
    useState<FeeAccountItem | null>(null);

  return (
    <>
      <OverdueAccountsPanel
        students={students}
        onRecordPayment={setSelectedFeeForPayment}
      />

      <Modal
        isOpen={Boolean(selectedFeeForPayment)}
        onClose={() => setSelectedFeeForPayment(null)}
        title="Record Payment Transaction"
      >
        {selectedFeeForPayment && (
          <RecordPaymentForm
            feeAccount={selectedFeeForPayment}
            onSuccess={() => {
              setSelectedFeeForPayment(null);
              router.refresh();
            }}
            onCancel={() => setSelectedFeeForPayment(null)}
          />
        )}
      </Modal>
    </>
  );
}
