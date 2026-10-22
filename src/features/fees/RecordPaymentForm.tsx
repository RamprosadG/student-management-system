"use client";

import React, { useState } from "react";
import Input from "@/components/ui/inputs/Input";
import Button from "@/components/ui/buttons/Button";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";
import { formatCurrency } from "@/lib/utils";

export interface FeeAccountItem {
  id: string; // studentFeeId
  studentId: string;
  fullName: string;
  amountDue: number;
  totalPaid: number;
  balance: number;
  dueDate: string;
}

interface RecordPaymentFormProps {
  feeAccount: FeeAccountItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RecordPaymentForm({
  feeAccount,
  onSuccess,
  onCancel,
}: RecordPaymentFormProps) {
  const [amount, setAmount] = useState<string>(
    feeAccount.balance > 0 ? String(feeAccount.balance) : ""
  );
  // The form only mounts inside a client modal, so the reference number and
  // today's date are seeded once per open instead of during a server render.
  /* eslint-disable react-hooks/purity */
  const [referenceNumber, setReferenceNumber] = useState<string>(
    `PAY-${Date.now().toString().slice(-6)}`
  );
  const [paidAt, setPaidAt] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  /* eslint-enable react-hooks/purity */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = "Payment amount must be greater than 0";
    } else if (numAmount > feeAccount.balance) {
      newErrors.amount = `Amount cannot exceed current balance of ${formatCurrency(
        feeAccount.balance
      )}`;
    }

    if (!referenceNumber.trim()) {
      newErrors.referenceNumber = "Reference number is required";
    }

    if (!paidAt) {
      newErrors.paidAt = "Payment date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFeeId: feeAccount.id,
          amount: parseFloat(amount),
          referenceNumber: referenceNumber.trim(),
          paidAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to record payment");
      }

      showSuccessAlert(data.message || "Payment recorded successfully");
      onSuccess();
    } catch (err) {
      showErrorAlert(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Account Balance Summary Banner */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Student</span>
          <span className="font-semibold text-slate-800">
            {feeAccount.fullName} ({feeAccount.studentId})
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Fee / Amount Due</span>
          <span className="font-medium text-slate-700">
            {formatCurrency(feeAccount.amountDue)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Paid to Date</span>
          <span className="font-medium text-emerald-600">
            {formatCurrency(feeAccount.totalPaid)}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
          <span className="font-semibold text-slate-900">
            Outstanding Balance
          </span>
          <span className="font-bold text-base text-indigo-700 font-mono">
            {formatCurrency(feeAccount.balance)}
          </span>
        </div>
      </div>

      <Input
        label="Payment Amount"
        type="number"
        step="0.01"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
      />

      <Input
        label="Transaction Reference Number"
        required
        placeholder="e.g. REC-98721, BANK-TRX-001"
        value={referenceNumber}
        onChange={(e) => setReferenceNumber(e.target.value)}
        error={errors.referenceNumber}
      />

      <Input
        label="Payment Date"
        type="date"
        required
        value={paidAt}
        onChange={(e) => setPaidAt(e.target.value)}
        error={errors.paidAt}
      />

      {/* Full-width action buttons matching design */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2 w-full">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isSubmitting}
        >
          Confirm Payment
        </Button>
      </div>
    </form>
  );
}
