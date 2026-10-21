"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Modal from "@/components/ui/modals/Modal";
import Pagination from "@/components/ui/pagination/Pagination";
import {
  RecordPaymentForm,
  FeeAccountItem,
} from "@/features/fees/RecordPaymentForm";
import { PaymentHistoryModal } from "@/features/fees/PaymentHistoryModal";
import { FeesFilters } from "./FeesFilters";
import { FeesTable } from "./FeesTable";
import type { FeeItem, StaffFeesFilters } from "@/types/fees";
import type { PaginationMeta } from "@/types/pagination";

interface StaffFeesSectionProps {
  ledger: FeeItem[];
  pagination: PaginationMeta | null;
  filters: StaffFeesFilters;
  isLoading?: boolean;
}

export function StaffFeesSection({
  ledger,
  pagination,
  filters,
  isLoading = false,
}: StaffFeesSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Recorded payments refetch on their own transition so the ledger keeps
  // showing rows while the form is still submitting.
  const [, startRefresh] = useTransition();
  const [selectedFeeForPayment, setSelectedFeeForPayment] =
    useState<FeeAccountItem | null>(null);
  const [selectedFeeForHistory, setSelectedFeeForHistory] =
    useState<FeeItem | null>(null);

  // Filter and page state lives in the URL, so the ledger can be rendered on the server.
  const navigate = (changes: Partial<StaffFeesFilters>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.statusFilter !== "ALL") {
      params.set("status", next.statusFilter);
    }
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
      <FeesFilters
        search={filters.search}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        statusFilter={filters.statusFilter}
        onStatusChange={(value) => navigate({ statusFilter: value, page: 1 })}
      />
      <FeesTable
        ledger={ledger}
        isLoading={isLoading || isPending}
        onRecordPayment={setSelectedFeeForPayment}
        onViewHistory={setSelectedFeeForHistory}
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
        isOpen={Boolean(selectedFeeForPayment)}
        onClose={() => setSelectedFeeForPayment(null)}
        title="Record Payment Transaction"
      >
        {selectedFeeForPayment && (
          <RecordPaymentForm
            feeAccount={selectedFeeForPayment}
            onSuccess={() => {
              setSelectedFeeForPayment(null);
              // Balances and KPI counters are both server reads, so refetch
              // instead of patching local state.
              refresh();
            }}
            onCancel={() => setSelectedFeeForPayment(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(selectedFeeForHistory)}
        onClose={() => setSelectedFeeForHistory(null)}
        title="Payment Transaction History"
      >
        {selectedFeeForHistory && (
          <PaymentHistoryModal
            studentName={selectedFeeForHistory.fullName}
            studentId={selectedFeeForHistory.studentId}
            payments={selectedFeeForHistory.payments}
            onClose={() => setSelectedFeeForHistory(null)}
          />
        )}
      </Modal>
    </>
  );
}
