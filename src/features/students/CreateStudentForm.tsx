"use client";

import React, { useState } from "react";
import Input from "@/components/ui/inputs/Input";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Button from "@/components/ui/buttons/Button";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";

interface EnrolmentFormProps {
  programmes: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateStudentForm({
  programmes,
  academicYears,
  onSuccess,
  onCancel,
}: EnrolmentFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [programmeId, setProgrammeId] = useState(programmes[0]?.id || "");
  const [academicYearId, setAcademicYearId] = useState(
    academicYears[0]?.id || ""
  );
  const [status, setStatus] = useState("ENROLLED");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "ENROLLED", label: "Enrolled" },
    { value: "DEFERRED", label: "Deferred" },
    { value: "WITHDRAWN", label: "Withdrawn" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const programmeOptions = programmes.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.code})`,
  }));

  const academicYearOptions = academicYears.map((ay) => ({
    value: ay.id,
    label: ay.name,
  }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!programmeId) newErrors.programmeId = "Please select a programme";
    if (!academicYearId) newErrors.academicYearId = "Please select an academic year";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          dateOfBirth,
          programmeId,
          academicYearId,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to enrol student");
      }

      showSuccessAlert(data.message || "Student enrolled successfully");
      onSuccess();
    } catch (err: any) {
      showErrorAlert(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full Name"
        required
        placeholder="e.g. Jane Doe"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />

      <Input
        label="Email Address"
        type="email"
        required
        placeholder="e.g. jane.doe@university.edu"
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
        label="Programme"
        required
        options={programmeOptions}
        value={programmeId}
        onChange={(val) => setProgrammeId(val)}
        error={errors.programmeId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Dropdown
          label="Academic Year"
          required
          options={academicYearOptions}
          value={academicYearId}
          onChange={(val) => setAcademicYearId(val)}
          error={errors.academicYearId}
        />

        <Dropdown
          label="Enrolment Status"
          required
          options={statusOptions}
          value={status}
          onChange={(val) => setStatus(val)}
        />
      </div>

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
          Enrol Student
        </Button>
      </div>
    </form>
  );
}
