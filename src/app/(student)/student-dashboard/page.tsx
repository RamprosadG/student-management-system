"use client";

import { useEffect, useState, useCallback } from "react";
import { useRole } from "@/components/shared/RoleContext";
import { StudentDashboardHero } from "@/components/features/student-dashboard/StudentDashboardHero";
import { StudentDashboardKpis } from "@/components/features/student-dashboard/StudentDashboardKpis";
import { StudentDeadlinesPanel } from "@/components/features/student-dashboard/StudentDeadlinesPanel";
import { StudentTuitionPanel } from "@/components/features/student-dashboard/StudentTuitionPanel";
import type { StudentDashboardData } from "@/types/student-dashboard";

export default function StudentDashboardPage() {
  const { selectedStudentId } = useRole();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("view", "student");
      if (selectedStudentId) {
        params.append("studentId", selectedStudentId);
      }

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        const mappedData: StudentDashboardData = {
          ...json.data,
          upcomingDeadlines: (json.data.upcomingDeadlines || []).map(
            (item: { assessmentId: string }) => ({
              ...item,
              id: item.assessmentId,
            })
          ),
        };
        setData(mappedData);
      }
    } catch (err) {
      console.error("Failed to load student dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchStudentDashboard();
  }, [fetchStudentDashboard]);

  const student = data?.student ?? null;
  const finance = data?.financialSummary || {
    amountDue: 0,
    totalPaid: 0,
    balance: 0,
    dueDate: null,
    status: "PAID" as const,
    daysOverdue: 0,
    recentPayments: [],
  };
  const academic = data?.academicProgress || {
    totalAssigned: 0,
    submittedCount: 0,
    pendingCount: 0,
    publishedCount: 0,
    averageGrade: null,
    overallClassification: null,
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <StudentDashboardHero
        student={student}
        isLoading={isLoading}
        onRefresh={fetchStudentDashboard}
      />
      <StudentDashboardKpis finance={finance} academic={academic} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudentDeadlinesPanel deadlines={data?.upcomingDeadlines || []} />
        <StudentTuitionPanel finance={finance} />
      </div>
    </div>
  );
}
