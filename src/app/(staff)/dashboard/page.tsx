"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/ui/modals/Modal";
import { RecordPaymentForm, FeeAccountItem } from "@/features/fees/RecordPaymentForm";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { DashboardKpis } from "@/components/features/dashboard/DashboardKpis";
import { OverdueAccountsPanel } from "@/components/features/dashboard/OverdueAccountsPanel";
import { RecentSubmissionsPanel } from "@/components/features/dashboard/RecentSubmissionsPanel";
import { UpcomingDeadlinesPanel } from "@/components/features/dashboard/UpcomingDeadlinesPanel";
import type { DashboardData } from "@/types/dashboard";

export default function StaffDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFeeForPayment, setSelectedFeeForPayment] =
    useState<FeeAccountItem | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        const mappedData: DashboardData = {
          ...json.data,
          priorityOverdueStudents: json.data.priorityOverdueStudents.map(
            (item: { studentFeeId: string }) => ({
              ...item,
              id: item.studentFeeId,
            })
          ),
          recentSubmissions: json.data.recentSubmissions.map(
            (item: { submissionId: string }) => ({
              ...item,
              id: item.submissionId,
            })
          ),
          upcomingDeadlines: json.data.upcomingDeadlines.map(
            (item: { assessmentId: string }) => ({
              ...item,
              id: item.assessmentId,
            })
          ),
        };
        setData(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpis = data?.kpis || {
    totalStudents: 0,
    enrolledStudents: 0,
    totalOutstandingBalance: 0,
    overdueAccountsCount: 0,
    totalAssessments: 0,
    pendingGradingCount: 0,
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader isLoading={isLoading} onRefresh={fetchDashboardData} />
      <DashboardKpis kpis={kpis} />
      <OverdueAccountsPanel
        students={data?.priorityOverdueStudents || []}
        onRecordPayment={setSelectedFeeForPayment}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSubmissionsPanel submissions={data?.recentSubmissions || []} />
        <UpcomingDeadlinesPanel deadlines={data?.upcomingDeadlines || []} />
      </div>

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
              fetchDashboardData();
            }}
            onCancel={() => setSelectedFeeForPayment(null)}
          />
        )}
      </Modal>
    </div>
  );
}
