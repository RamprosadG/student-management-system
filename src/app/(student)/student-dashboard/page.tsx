"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/buttons/Button";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import StatCard from "@/components/ui/stats/StatCard";
import { useRole } from "@/components/shared/RoleContext";
import { TableActionLink } from "@/components/ui/buttons/TableActionButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineExclamationCircle,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
  HiRefresh,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineUpload,
  HiOutlineCash,
  HiOutlineInformationCircle,
} from "react-icons/hi";

interface UpcomingDeadlineItem {
  id: string; // for DataTable
  assessmentId: string;
  title: string;
  moduleCode: string;
  moduleTitle: string;
  deadline: string;
  isPastDeadline: boolean;
  submission: {
    id: string;
    versionNumber: number;
    submittedAt: string;
    isLate: boolean;
  } | null;
}

interface PaymentRecordItem {
  id: string;
  amount: number;
  paidAt: string;
  referenceNumber: string;
}

interface StudentDashboardData {
  student: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    status: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
    academicYear: {
      name: string;
    };
  } | null;
  financialSummary: {
    amountDue: number;
    totalPaid: number;
    balance: number;
    dueDate: string | null;
    status: "PAID" | "PARTIAL" | "OVERDUE";
    daysOverdue: number;
    recentPayments: PaymentRecordItem[];
  };
  academicProgress: {
    totalAssigned: number;
    submittedCount: number;
    pendingCount: number;
    publishedCount: number;
    averageGrade: number | null;
    overallClassification: string | null;
  };
  upcomingDeadlines: UpcomingDeadlineItem[];
}

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
          upcomingDeadlines: (json.data.upcomingDeadlines || []).map((item: any) => ({
            ...item,
            id: item.assessmentId,
          })),
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

  const student = data?.student;
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

  // Assessment Deadline Columns for DataTable
  const deadlineColumns: Column<UpcomingDeadlineItem>[] = [
    {
      key: "module",
      header: "Module",
      render: (item) => (
        <div className="flex flex-col">
          <Badge variant="info" size="sm" className="w-fit">
            {item.moduleCode}
          </Badge>
          <span className="text-sm font-semibold text-slate-800 mt-1">
            {item.moduleTitle}
          </span>
        </div>
      ),
    },
    {
      key: "assessment",
      header: "Assessment Title",
      render: (item) => (
        <span className="text-sm font-medium text-slate-900">{item.title}</span>
      ),
    },
    {
      key: "deadline",
      header: "Submission Deadline",
      render: (item) => (
        <div className="flex flex-col">
          <span
            className={`text-xs font-bold ${item.isPastDeadline ? "text-red-600" : "text-slate-800"
              }`}
          >
            {formatDate(item.deadline)}
          </span>
          <span className="text-[11px] text-gray-400">
            {item.isPastDeadline ? "Deadline passed" : "Open for submissions"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Your Status",
      render: (item) => {
        if (!item.submission) {
          return item.isPastDeadline ? (
            <Badge variant="danger" size="sm">
              <span className="flex items-center gap-1">
                <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
                Overdue
              </span>
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              <span className="flex items-center gap-1">
                <HiOutlineClock className="w-3.5 h-3.5" />
                Pending
              </span>
            </Badge>
          );
        }

        return (
          <Badge variant={item.submission.isLate ? "danger" : "success"} size="sm">
            <span className="flex items-center gap-1">
              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
              {item.submission.isLate ? "Submitted Late" : "Submitted On-Time"} (v{item.submission.versionNumber})
            </span>
          </Badge>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      headerClassName: "text-right",
      render: () => (
        <TableActionLink href="/student-assessments" tooltip="Upload work">
          <HiOutlineUpload className="w-4 h-4" />
        </TableActionLink>
      ),
    },
  ];

  // Payment Record Columns for DataTable
  const paymentColumns: Column<PaymentRecordItem>[] = [
    {
      key: "ref",
      header: "Receipt Reference",
      render: (p) => (
        <span className="text-xs font-mono font-semibold text-slate-800">
          {p.referenceNumber}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount Paid",
      render: (p) => (
        <span className="text-sm font-bold text-emerald-600 font-mono">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Payment Date",
      render: (p) => (
        <span className="text-xs text-slate-600">{formatDate(p.paidAt)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Student Welcome & Profile Hero Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/50 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                Student Portal
              </span>
              <span className="text-xs font-mono text-slate-500">
                {student?.studentId || "SMS-STUDENT"}
              </span>
              {student && (
                <Badge
                  variant={
                    student.status === "ENROLLED"
                      ? "success"
                      : student.status === "DEFERRED"
                        ? "warning"
                        : "neutral"
                  }
                  size="sm"
                >
                  {student.status}
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Welcome back, {student?.fullName || "Student"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {student
                ? `${student.programme.name} (${student.programme.code}) • Academic Year ${student.academicYear.name}`
                : "Your personal academic overview, fee status, and upcoming deadlines."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary-outline"
              size="md"
              icon={<HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              onClick={fetchStudentDashboard}
              disabled={isLoading}
            >
              Refresh Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Primary KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tuition Fee Balance */}
        <StatCard
          title="Tuition Balance"
          value={formatCurrency(finance.balance)}
          subtitle={
            finance.status === "PAID"
              ? "All fees settled"
              : finance.status === "OVERDUE"
                ? `${finance.daysOverdue} days past due`
                : `Due: ${finance.dueDate ? formatDate(finance.dueDate) : "Scheduled"}`
          }
          icon={<HiOutlineCreditCard className="w-6 h-6" />}
          iconBgColor={
            finance.status === "PAID"
              ? "bg-emerald-100"
              : finance.status === "OVERDUE"
                ? "bg-rose-100"
                : "bg-amber-100"
          }
          iconColor={
            finance.status === "PAID"
              ? "text-emerald-600"
              : finance.status === "OVERDUE"
                ? "text-rose-600"
                : "text-amber-600"
          }
          bgColor={
            finance.status === "PAID"
              ? "bg-emerald-50/50"
              : finance.status === "OVERDUE"
                ? "bg-rose-50/50"
                : "bg-amber-50/50"
          }
          borderColor={
            finance.status === "PAID"
              ? "border-emerald-200"
              : finance.status === "OVERDUE"
                ? "border-rose-200"
                : "border-amber-200"
          }
        />

        {/* Submissions Handed In */}
        <StatCard
          title="Assessments Handed In"
          value={`${academic.submittedCount} / ${academic.totalAssigned}`}
          subtitle={`${academic.pendingCount} pending submission`}
          icon={<HiOutlineClipboardList className="w-6 h-6" />}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50/50"
          borderColor="border-indigo-200"
        />

        {/* Certified Average Score */}
        <StatCard
          title="Published Grade Average"
          value={
            academic.averageGrade !== null
              ? `${academic.averageGrade}%`
              : "Pending"
          }
          subtitle={`${academic.publishedCount} results released`}
          icon={<HiOutlineAcademicCap className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          bgColor="bg-blue-50/50"
          borderColor="border-blue-200"
        />

        {/* Current Classification */}
        <StatCard
          title="Academic Standing"
          value={academic.overallClassification || "In Progress"}
          subtitle="Based on published marks"
          icon={<HiOutlineDocumentReport className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          bgColor="bg-purple-50/50"
          borderColor="border-purple-200"
        />
      </div>

      {/* Overdue Fee Alert (If applicable) */}
      {finance.status === "OVERDUE" && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-4 flex items-start gap-3">
          <HiOutlineExclamationCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 space-y-1">
            <span className="font-bold text-sm block">Action Required: Overdue Tuition Balance</span>
            <p>
              Your account has an outstanding balance of <strong>{formatCurrency(finance.balance)}</strong> which was due on{" "}
              {finance.dueDate ? formatDate(finance.dueDate) : "the scheduled date"}. Please contact Registry Finance or submit your payment receipt reference to avoid administrative withholding.
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Deadlines + Tuition Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Assessment Timetable & Deadlines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Curriculum Assessments & Deadlines
              </h2>
            </div>
            <Link
              href="/student-assessments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All Submissions</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            columns={deadlineColumns}
            data={data?.upcomingDeadlines || []}
            emptyMessage="No assessment deadlines currently assigned to your programme."
          />
        </div>

        {/* Right Column (1 Col): Tuition Ledger & Quick Action Shortcuts */}
        <div className="space-y-6">
          {/* Tuition Fee Breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <HiOutlineCash className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Tuition Account
                </h3>
              </div>
              <Badge
                variant={
                  finance.status === "PAID"
                    ? "success"
                    : finance.status === "OVERDUE"
                      ? "danger"
                      : "warning"
                }
                size="sm"
              >
                {finance.status}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Standard Programme Fee:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatCurrency(finance.amountDue)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Amount Paid:</span>
                <span className="font-semibold text-emerald-600 font-mono">
                  {formatCurrency(finance.totalPaid)}
                </span>
              </div>
              <div className="flex justify-between text-slate-800 pt-2 border-t border-gray-100 font-bold">
                <span>Outstanding Balance:</span>
                <span className="text-rose-600 font-mono text-sm">
                  {formatCurrency(finance.balance)}
                </span>
              </div>
            </div>

            {/* Recent Payment Receipts */}
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Payment History ({finance.recentPayments.length})
              </span>
              {finance.recentPayments.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">
                  No payment transactions recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {finance.recentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px]"
                    >
                      <div>
                        <span className="font-mono font-semibold text-slate-800 block">
                          {p.referenceNumber}
                        </span>
                        <span className="text-slate-400">
                          {formatDate(p.paidAt)}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600 font-mono">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Quick Shortcuts
            </span>

            <Link
              href="/student-assessments"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-indigo-50/40 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <HiOutlineUpload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Submit Assignment
                  </span>
                  <span className="text-[11px] text-slate-500">
                    PDF or DOCX document upload
                  </span>
                </div>
              </div>
              <HiOutlineArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>

            <Link
              href="/marksheet"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-200 text-slate-700">
                  <HiOutlineDocumentReport className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Academic Marksheet
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Official grades & transcripts
                  </span>
                </div>
              </div>
              <HiOutlineArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
