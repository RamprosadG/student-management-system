"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/buttons/Button";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Modal from "@/components/ui/modals/Modal";
import StatCard from "@/components/ui/stats/StatCard";
import { RecordPaymentForm, FeeAccountItem } from "@/features/fees/RecordPaymentForm";
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
} from "react-icons/hi";
import { MdPayment } from "react-icons/md";

interface PriorityOverdueStudent {
  id: string; // for DataTable
  studentFeeId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programmeCode: string;
  amountDue: number;
  totalPaid: number;
  balance: number;
  dueDate: string;
  daysOverdue: number;
}

interface RecentSubmission {
  id: string; // for DataTable
  submissionId: string;
  studentName: string;
  studentId: string;
  assessmentTitle: string;
  moduleCode: string;
  fileName: string;
  submittedAt: string;
  isLate: boolean;
  lateDurationText: string | null;
  versionNumber: number;
  grade: number | null;
  isPublished: boolean;
}

interface UpcomingDeadline {
  id: string; // for DataTable
  assessmentId: string;
  title: string;
  moduleCode: string;
  moduleTitle: string;
  programmeCode: string;
  deadline: string;
  isPastDeadline: boolean;
  submissionCount: number;
}

interface DashboardData {
  kpis: {
    totalStudents: number;
    enrolledStudents: number;
    totalOutstandingBalance: number;
    overdueAccountsCount: number;
    totalAssessments: number;
    pendingGradingCount: number;
  };
  priorityOverdueStudents: PriorityOverdueStudent[];
  recentSubmissions: RecentSubmission[];
  upcomingDeadlines: UpcomingDeadline[];
}

export default function StaffDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Payment Modal
  const [selectedFeeForPayment, setSelectedFeeForPayment] =
    useState<FeeAccountItem | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        // Map unique id to arrays for DataTable
        const mappedData: DashboardData = {
          ...json.data,
          priorityOverdueStudents: json.data.priorityOverdueStudents.map(
            (item: any) => ({
              ...item,
              id: item.studentFeeId,
            })
          ),
          recentSubmissions: json.data.recentSubmissions.map((item: any) => ({
            ...item,
            id: item.submissionId,
          })),
          upcomingDeadlines: json.data.upcomingDeadlines.map((item: any) => ({
            ...item,
            id: item.assessmentId,
          })),
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

  // Columns for Priority Overdue Table
  const overdueColumns: Column<PriorityOverdueStudent>[] = [
    {
      key: "student",
      header: "Student",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{item.studentName}</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="font-mono">{item.studentId}</span>
            <span>&bull;</span>
            <span>{item.programmeCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Outstanding Balance",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-rose-600 font-mono">
            {formatCurrency(item.balance)}
          </span>
          <span className="text-[11px] text-slate-400">
            Due {formatDate(item.dueDate)}
          </span>
        </div>
      ),
    },
    {
      key: "delay",
      header: "Delay",
      render: (item) => (
        <Badge variant="danger" size="sm">
          {item.daysOverdue} {item.daysOverdue === 1 ? "day" : "days"} overdue
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      headerClassName: "text-right",
      render: (item) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            setSelectedFeeForPayment({
              id: item.studentFeeId,
              studentId: item.studentId,
              fullName: item.studentName,
              amountDue: item.amountDue,
              totalPaid: item.totalPaid,
              balance: item.balance,
              dueDate: item.dueDate,
            })
          }
        >
          <span className="flex items-center gap-1">
            <MdPayment className="w-3.5 h-3.5" />
            Record Payment
          </span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
              Registry Command Center
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Registry Administrative Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time financial status, urgent overdue accounts, grading progress, and curriculum submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="white"
            size="md"
            icon={<HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            Refresh Dashboard
          </Button>
        </div>
      </div>

      {/* Primary KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={kpis.enrolledStudents}
          subtitle={`Total records: ${kpis.totalStudents}`}
          icon={<HiOutlineAcademicCap className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Outstanding Fees"
          value={formatCurrency(kpis.totalOutstandingBalance)}
          subtitle="Real-time uncollected tuition"
          icon={<HiOutlineCreditCard className="w-6 h-6" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Overdue Accounts"
          value={kpis.overdueAccountsCount}
          subtitle="Past due date & unpaid"
          icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="Pending Evaluations"
          value={kpis.pendingGradingCount}
          subtitle={`Across ${kpis.totalAssessments} assessments`}
          icon={<HiOutlineDocumentReport className="w-6 h-6" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Priority Section: Overdue Fees Action Panel */}
      <div className="rounded-xl border border-rose-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-rose-100 bg-rose-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <HiOutlineExclamationCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Priority Overdue Accounts
              </h2>
              <p className="text-xs text-rose-700">
                Students with past-due balances requiring immediate collection follow-up
              </p>
            </div>
          </div>

          <Link
            href="/fees"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View Fee Ledger</span>
            <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={overdueColumns}
          data={data?.priorityOverdueStudents || []}
          emptyMessage="No overdue student accounts detected. All fees are in good standing."
        />
      </div>

      {/* Two Column Grid: Recent Submissions + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Submissions */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <HiOutlineClipboardList className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Recent Submissions
              </h2>
            </div>
            <Link
              href="/results"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Grade Submissions</span>
              <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!data?.recentSubmissions || data.recentSubmissions.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No recent student submissions recorded.
              </p>
            ) : (
              data.recentSubmissions.map((sub) => (
                <div
                  key={sub.submissionId}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold uppercase text-indigo-700">
                        {sub.moduleCode}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        &bull; {sub.studentName}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 truncate mt-0.5" title={sub.assessmentTitle}>
                      {sub.assessmentTitle}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(sub.submittedAt)} (v{sub.versionNumber})
                    </span>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {sub.isLate ? (
                      <Badge variant="danger" size="sm">
                        Late
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        On-time
                      </Badge>
                    )}
                    {sub.grade !== null ? (
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {sub.grade}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium">
                        Ungraded
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Assessment Deadlines */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Assessment Timetable & Deadlines
              </h2>
            </div>
            <Link
              href="/assessments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage Assessments</span>
              <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!data?.upcomingDeadlines || data.upcomingDeadlines.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No active assessment deadlines scheduled.
              </p>
            ) : (
              data.upcomingDeadlines.map((item) => (
                <div
                  key={item.assessmentId}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold uppercase text-indigo-700">
                        {item.moduleCode}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({item.programmeCode})
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                      {item.title}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {item.submissionCount} submissions received
                    </span>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-bold ${
                        item.isPastDeadline ? "text-red-600" : "text-slate-800"
                      }`}
                    >
                      {formatDate(item.deadline)}
                    </span>
                    <Badge
                      variant={item.isPastDeadline ? "neutral" : "info"}
                      size="sm"
                    >
                      {item.isPastDeadline ? "Closed" : "Active"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Transaction Modal */}
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
