"use client";

import React, { useState, useRef } from "react";
import Button from "@/components/ui/buttons/Button";
import Badge from "@/components/ui/badges/Badge";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";
import { formatDate } from "@/lib/utils";
import {
  HiOutlineUpload,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineTrash,
} from "react-icons/hi";

interface AssessmentTarget {
  id: string;
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  module: {
    code: string;
    title: string;
    programme: {
      code: string;
      name: string;
    };
  };
  submission?: {
    id: string;
    latestVersionNumber: number;
    fileName: string;
    fileSize: number;
    submittedAt: string;
    isLate: boolean;
    lateDurationText: string | null;
  } | null;
}

interface SubmitAssessmentModalProps {
  assessment: AssessmentTarget;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function SubmitAssessmentModal({
  assessment,
  studentId,
  studentName,
  onSuccess,
  onClose,
}: SubmitAssessmentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isResubmission = Boolean(assessment.submission);
  const isPastDeadline = new Date(assessment.deadline) < new Date();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      return "Invalid file type. Only PDF (.pdf) and Word (.docx) documents are permitted.";
    }
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      return "File size exceeds the 10MB maximum limit.";
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateFile(file);
      if (err) {
        setError(err);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const err = validateFile(file);
      if (err) {
        setError(err);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select or drop a valid document to submit");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("assessmentId", assessment.id);
      formData.append("file", selectedFile);

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit assessment");
      }

      showSuccessAlert(data.message || "Assessment submitted successfully");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to upload submission");
      showErrorAlert(err.message || "Failed to upload submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Target Assessment Overview */}
      <div className="rounded-xl border border-gray-100 bg-slate-50/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {assessment.module.code} &bull; {assessment.module.title}
          </span>
          {isResubmission ? (
            <Badge variant="info" size="sm">
              Current: Version {assessment.submission?.latestVersionNumber}
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              First Submission
            </Badge>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900">{assessment.title}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <HiOutlineClock className="w-4 h-4 text-slate-400" />
          <span>Deadline: {formatDate(assessment.deadline)}</span>
        </div>
      </div>

      {/* Late Warning Notice */}
      {isPastDeadline && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-3">
          <HiOutlineExclamation className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <span className="font-bold block">Notice: Assessment Deadline has Passed</span>
            <p>
              Late submissions are permitted by Registry policy but will be visually flagged with
              the elapsed delay on your marksheet and staff grading ledger.
            </p>
          </div>
        </div>
      )}

      {/* Resubmission Notice */}
      {isResubmission && !isPastDeadline && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 flex items-start gap-2.5">
          <HiOutlineCheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            You previously submitted <strong>{assessment.submission?.fileName}</strong>. Uploading a
            new file will create <strong>Version {(assessment.submission?.latestVersionNumber || 1) + 1}</strong>{" "}
            and preserve your submission history.
          </p>
        </div>
      )}

      {/* File Dropzone */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Upload Document (PDF or DOCX, max 10MB)
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/60 scale-[1.01]"
              : selectedFile
              ? "border-emerald-400 bg-emerald-50/30"
              : "border-gray-300 hover:border-indigo-400 hover:bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center gap-3 w-full">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                <HiOutlineDocumentText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)} &bull; Ready to upload
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                title="Remove file"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <HiOutlineUpload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to select or drag and drop your file here
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supported extensions: .pdf, .docx (Max 10 MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs font-medium text-red-600 mt-1">{error}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary-outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!selectedFile || isSubmitting}
        >
          {isResubmission
            ? `Submit Version ${(assessment.submission?.latestVersionNumber || 1) + 1}`
            : "Submit Assessment"}
        </Button>
      </div>
    </form>
  );
}
