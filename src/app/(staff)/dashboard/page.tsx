"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/buttons/Button";
import Badge from "@/components/ui/badges/Badge";
import DataTable, { Column } from "@/components/ui/tables/DataTable";
import Modal from "@/components/ui/modals/Modal";
import StatCard from "@/components/ui/stats/StatCard";
import { RecordPaymentForm, FeeAccountItem } from "@/features/fees/RecordPaymentForm";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        <TableActionButton
          tooltip="Record payment"
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
          <MdPayment className="w-4 h-4" />
        </TableActionButton>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
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
            variant="secondary-outline"
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
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50/50"
          borderColor="border-indigo-200"
        />

        <StatCard
          title="Outstanding Fees"
          value={formatCurrency(kpis.totalOutstandingBalance)}
          subtitle="Real-time uncollected tuition"
          icon={<HiOutlineCreditCard className="w-6 h-6" />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          bgColor="bg-amber-50/50"
          borderColor="border-amber-200"
        />

        <StatCard
          title="Overdue Accounts"
          value={kpis.overdueAccountsCount}
          subtitle="Past due date & unpaid"
          icon={<HiOutlineExclamationCircle className="w-6 h-6" />}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          bgColor="bg-rose-50/50"
          borderColor="border-rose-200"
        />

        <StatCard
          title="Pending Evaluations"
          value={kpis.pendingGradingCount}
          subtitle={`Across ${kpis.totalAssessments} assessments`}
          icon={<HiOutlineDocumentReport className="w-6 h-6" />}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50/50"
          borderColor="border-emerald-200"
        />
      </div>


      {/* Priority Section: Overdue Fees Action Panel */}
      <div className="rounded-xl border border-rose-200 bg-white shadow-xs overflow-visible">
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
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200">
            <div className="flex items-center gap-2 min-w-0">
              <HiOutlineClipboardList className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-base font-bold text-slate-900">
                Recent Submissions
              </h2>
            </div>

            <Link
              href="/results"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
            >
              <span>Grade Submissions</span>
              <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student / Module</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Grade</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {!data?.recentSubmissions ||
                  data.recentSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No recent student submissions recorded.
                    </td>
                  </tr>
                ) : (
                  data.recentSubmissions.map((sub, index) => (
                    <tr
                      key={sub.submissionId}
                      className={`transition-colors hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-100"
                        }`}
                    >
                      <td className="px-4 py-3">
                        <div className="min-w-0 max-w-[220px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold uppercase text-indigo-700">
                              {sub.moduleCode}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {sub.studentName}
                            </span>
                          </div>
                          <p
                            className="mt-1 text-xs text-slate-500 truncate"
                            title={sub.assessmentTitle}
                          >
                            {sub.assessmentTitle}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Version {sub.versionNumber}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                        {formatDate(sub.submittedAt)}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {sub.isLate ? (
                          <Badge variant="danger" size="sm">
                            Late
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            On-time
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {sub.grade !== null ? (
                          <span className="text-sm font-bold font-mono text-slate-800">
                            {sub.grade}%
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">
                            Ungraded
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Assessment Deadlines */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200">
            <div className="flex items-center gap-2 min-w-0">
              <HiOutlineClock className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-base font-bold text-slate-900">
                Assessment Deadlines
              </h2>
            </div>

            <Link
              href="/assessments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
            >
              <span>Manage Assessments</span>
              <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Assessment</th>
                  <th className="px-4 py-3 font-semibold">Deadline</th>
                  <th className="px-4 py-3 font-semibold text-center">
                    Submissions
                  </th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {!data?.upcomingDeadlines ||
                  data.upcomingDeadlines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No active assessment deadlines scheduled.
                    </td>
                  </tr>
                ) : (
                  data.upcomingDeadlines.map((item, index) => (
                    <tr
                      key={item.assessmentId}
                      className={`transition-colors hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-100"
                        }`}
                    >
                      <td className="px-4 py-3">
                        <div className="min-w-0 max-w-[220px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold uppercase text-indigo-700">
                              {item.moduleCode}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ({item.programmeCode})
                            </span>
                          </div>
                          <p
                            className="mt-1 text-sm font-semibold text-slate-900 truncate"
                            title={item.title}
                          >
                            {item.title}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold ${item.isPastDeadline
                            ? "text-rose-600"
                            : "text-slate-700"
                            }`}
                        >
                          {formatDate(item.deadline)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-700">
                          {item.submissionCount}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={item.isPastDeadline ? "neutral" : "info"}
                          size="sm"
                        >
                          {item.isPastDeadline ? "Closed" : "Active"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
