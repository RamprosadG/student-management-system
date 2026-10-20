"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRole } from "@/components/shared/RoleContext";
import { StudentMarksheetHeader } from "@/components/features/student-marksheet/StudentMarksheetHeader";
import { StudentMarksheetKpis } from "@/components/features/student-marksheet/StudentMarksheetKpis";
import { StudentMarksheetPolicyBanner } from "@/components/features/student-marksheet/StudentMarksheetPolicyBanner";
import { StudentMarksheetTable } from "@/components/features/student-marksheet/StudentMarksheetTable";
import type { MarksheetResponse } from "@/types/marksheet";

export default function MarksheetPage() {
  const { selectedStudentId } = useRole();

  const [data, setData] = useState<MarksheetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarksheet = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("view", "student");
      if (selectedStudentId) {
        params.append("studentId", selectedStudentId);
      }

      const res = await fetch(`/api/results?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch student marksheet:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchMarksheet();
  }, [fetchMarksheet]);

  const student = data?.student;
  const marksheet = data?.marksheet || [];
  const stats = data?.stats || {
    totalAssessments: 0,
    publishedResultsCount: 0,
    withheldOrPendingCount: 0,
    averageGrade: null,
    overallClassification: null,
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <StudentMarksheetHeader
        student={student}
        isLoading={isLoading}
        onRefresh={fetchMarksheet}
      />

      <StudentMarksheetKpis stats={stats} />

      <StudentMarksheetPolicyBanner />

      <StudentMarksheetTable
        marksheet={marksheet}
        isLoading={isLoading}
        emptyMessage="No enrolled assessments found for your programme."
      />
    </div>
  );
}
