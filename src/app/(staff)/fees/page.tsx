"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/ui/modals/Modal";
import {
  RecordPaymentForm,
  FeeAccountItem,
} from "@/features/fees/RecordPaymentForm";
import { PaymentHistoryModal } from "@/features/fees/PaymentHistoryModal";
import { FeesHeader } from "@/components/features/fees/FeesHeader";
import { FeesSummary } from "@/components/features/fees/FeesSummary";
import { FeesFilters } from "@/components/features/fees/FeesFilters";
import { FeesTable } from "@/components/features/fees/FeesTable";
import type { FeeItem, FinancialSummary } from "@/types/fees";

export default function FeesPage() {
  const [ledger, setLedger] = useState<FeeItem[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    overdueCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedFeeForPayment, setSelectedFeeForPayment] =
    useState<FeeAccountItem | null>(null);
  const [selectedFeeForHistory, setSelectedFeeForHistory] =
    useState<FeeItem | null>(null);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/fees?${params.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        setLedger(result.data.ledger || []);
        setSummary(
          result.data.summary || {
            totalInvoiced: 0,
            totalCollected: 0,
            totalOutstanding: 0,
            overdueCount: 0,
          }
        );
      }
    } catch (e) {
      console.error("Failed to load fee ledger", e);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <FeesHeader onRefresh={() => fetchFees()} />
      <FeesSummary summary={summary} />
      <FeesFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <FeesTable
        ledger={ledger}
        isLoading={isLoading}
        onRecordPayment={setSelectedFeeForPayment}
        onViewHistory={setSelectedFeeForHistory}
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
              fetchFees();
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
    </div>
  );
}
