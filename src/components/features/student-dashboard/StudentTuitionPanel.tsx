"use client";

import Link from "next/link";
import Badge from "@/components/ui/badges/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { StudentFinancialSummary } from "@/types/student-dashboard";
import {
  HiOutlineDocumentReport,
  HiOutlineArrowRight,
  HiOutlineUpload,
  HiOutlineCash,
} from "react-icons/hi";

interface StudentTuitionPanelProps {
  finance: StudentFinancialSummary;
}

export function StudentTuitionPanel({ finance }: StudentTuitionPanelProps) {
  return (
    <div className="space-y-6">
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
  );
}
