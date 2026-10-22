"use client";

import React, { useState } from "react";
import Input from "@/components/ui/inputs/Input";
import Button from "@/components/ui/buttons/Button";
import Badge from "@/components/ui/badges/Badge";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";
import {
  getGradeClassification,
  Classification,
} from "@/lib/validations/result";
import { HiOutlineAcademicCap } from "react-icons/hi";

interface GradeEntrySubmission {
  submissionId: string;
  studentName: string;
  studentId: string;
  assessmentTitle: string;
  moduleCode: string;
  moduleTitle: string;
  grade: number | null;
  classification: Classification | null;
  isPublished: boolean;
}

interface GradeEntryModalProps {
  submission: GradeEntrySubmission;
  onSuccess: () => void;
  onClose: () => void;
}

export function GradeEntryModal({
  submission,
  onSuccess,
  onClose,
}: GradeEntryModalProps) {
  const [gradeInput, setGradeInput] = useState<string>(
    submission.grade !== null ? String(submission.grade) : ""
  );
  const [isPublished, setIsPublished] = useState<boolean>(submission.isPublished);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericScore = parseFloat(gradeInput);
  const isValidScore = !isNaN(numericScore) && numericScore >= 0 && numericScore <= 100;
  const currentClassification = isValidScore
    ? getGradeClassification(numericScore)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidScore) {
      setError("Please enter a valid numeric grade between 0 and 100");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.submissionId,
          grade: numericScore,
          isPublished,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record grade");
      }

      showSuccessAlert(data.message || "Grade recorded successfully");
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save grade";
      setError(message);
      showErrorAlert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Target Context Summary */}
      <div className="rounded-xl border border-gray-100 bg-slate-50/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {submission.moduleCode} &bull; {submission.moduleTitle}
          </span>
          <span className="text-xs font-mono font-medium text-slate-500">
            {submission.studentId}
          </span>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{submission.assessmentTitle}</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Student: <strong className="text-slate-800">{submission.studentName}</strong>
          </p>
        </div>
      </div>

      {/* Grade Entry and Instant Classification */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Numeric Score (0 – 100)
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.5"
              placeholder="e.g. 78.5"
              value={gradeInput}
              onChange={(e) => {
                setGradeInput(e.target.value);
                if (error) setError(null);
              }}
              icon={<HiOutlineAcademicCap className="w-5 h-5" />}
            />
          </div>

          {/* Classification Pill Preview */}
          <div className="min-w-[130px] flex items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-white shadow-2xs">
            {currentClassification ? (
              <Badge
                variant={
                  currentClassification === "Distinction"
                    ? "info"
                    : currentClassification === "Merit"
                    ? "success"
                    : currentClassification === "Pass"
                    ? "warning"
                    : "danger"
                }
                size="md"
              >
                {currentClassification}
              </Badge>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Auto Classification</span>
            )}
          </div>
        </div>
        {error && <p className="text-xs font-medium text-red-600 mt-1">{error}</p>}
      </div>

      {/* Classification Legend / Scale Reference */}
      <div className="rounded-lg border border-gray-100 bg-white p-3 text-xs text-slate-600 space-y-1.5">
        <div className="font-semibold text-slate-700">Official Classification Scale:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">
            &ge; 70 Distinction
          </span>
          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium">
            &ge; 60 Merit
          </span>
          <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 font-medium">
            &ge; 40 Pass
          </span>
          <span className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-medium">
            &lt; 40 Fail
          </span>
        </div>
      </div>

      {/* Publication Choice */}
      <div className="rounded-xl border border-gray-200 p-3.5 bg-slate-50 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 block">
            Publish Grade to Student
          </span>
          <span className="text-[11px] text-slate-500">
            If unchecked, this result remains withheld in draft status for Registry review.
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Action Buttons take full width */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 w-full">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isSubmitting}
          disabled={!isValidScore || isSubmitting}
        >
          {submission.grade !== null ? "Update Grade" : "Save Grade"}
        </Button>
      </div>
    </form>
  );
}
