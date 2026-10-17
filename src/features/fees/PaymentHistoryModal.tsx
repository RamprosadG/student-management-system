"use client";

import React from "react";
import Button from "@/components/ui/buttons/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { HiOutlineReceiptTax } from "react-icons/hi";

interface PaymentItem {
  id: string;
  amount: number;
  paidAt: string;
  referenceNumber: string;
}

interface PaymentHistoryDrawerProps {
  studentName: string;
  studentId: string;
  payments: PaymentItem[];
  onClose: () => void;
}

export function PaymentHistoryModal({
  studentName,
  studentId,
  payments,
  onClose,
}: PaymentHistoryDrawerProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Student Details Header */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">{studentName}</h4>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{studentId}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 block">Total Payments</span>
          <span className="font-bold text-sm text-emerald-600">
            {formatCurrency(
              payments.reduce((acc, p) => acc + p.amount, 0)
            )}
          </span>
        </div>
      </div>

      {/* Itemized Transactions Table */}
      {payments.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-lg text-sm">
          No payments recorded yet for this student.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Reference #</th>
                <th className="px-4 py-2.5 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">{formatDate(p.paidAt)}</td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-800">
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineReceiptTax className="w-3.5 h-3.5 text-gray-400" />
                      {p.referenceNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Footer with full-width close button */}
      <div className="pt-3 border-t border-gray-100 w-full mt-2">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
