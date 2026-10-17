"use client";

import React, { useState } from "react";
import Input from "@/components/ui/inputs/Input";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Button from "@/components/ui/buttons/Button";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";

export interface StudentToEdit {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  status: "ENROLLED" | "DEFERRED" | "WITHDRAWN" | "COMPLETED";
}

interface UpdateStudentFormProps {
  student: StudentToEdit;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateStudentForm({
  student,
  onSuccess,
  onCancel,
}: UpdateStudentFormProps) {
  const [fullName, setFullName] = useState(student.fullName);
  const [email, setEmail] = useState(student.email);
  const [dateOfBirth, setDateOfBirth] = useState(
    student.dateOfBirth.includes("T")
      ? student.dateOfBirth.split("T")[0]
      : student.dateOfBirth
  );
  const [status, setStatus] = useState<string>(student.status);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "ENROLLED", label: "Enrolled" },
    { value: "DEFERRED", label: "Deferred" },
    { value: "WITHDRAWN", label: "Withdrawn" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name cannot be empty";
    if (!email.trim()) {
      newErrors.email = "Email cannot be empty";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: student.id,
          fullName,
          email,
          dateOfBirth,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update student");
      }

      showSuccessAlert(data.message || "Student record updated");
      onSuccess();
    } catch (err: any) {
      showErrorAlert(err.message || "Failed to update student");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Read-only Student ID Banner */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Student ID</span>
        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
          {student.studentId}
        </span>
      </div>

      <Input
        label="Full Name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />

      <Input
        label="Email Address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <Input
        label="Date of Birth"
        type="date"
        required
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        error={errors.dateOfBirth}
      />

      <Dropdown
        label="Enrolment Status"
        required
        options={statusOptions}
        value={status}
        onChange={(val) => setStatus(val)}
      />

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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
