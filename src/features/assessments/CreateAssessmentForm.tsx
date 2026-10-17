"use client";

import React, { useState } from "react";
import Input from "@/components/ui/inputs/Input";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Button from "@/components/ui/buttons/Button";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alerts/Alerts";

interface ModuleOption {
  id: string;
  code: string;
  title: string;
  programme?: {
    code: string;
    name: string;
  };
}

interface CreateAssessmentFormProps {
  modules: ModuleOption[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAssessmentForm({
  modules,
  onSuccess,
  onCancel,
}: CreateAssessmentFormProps) {
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState(modules[0]?.id || "");
  const [deadline, setDeadline] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moduleDropdownOptions = modules.map((m) => ({
    value: m.id,
    label: `${m.code} - ${m.title} (${m.programme?.code || "Module"})`,
  }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Assessment title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!moduleId) {
      newErrors.moduleId = "Please select a target module";
    }

    if (!deadline) {
      newErrors.deadline = "Submission deadline date and time is required";
    } else {
      const selected = new Date(deadline);
      if (isNaN(selected.getTime())) {
        newErrors.deadline = "Please enter a valid date and time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          moduleId,
          deadline: new Date(deadline).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create assessment");
      }

      showSuccessAlert(
        `Assessment "${title}" has been successfully published.`
      );
      onSuccess();
    } catch (err: any) {
      showErrorAlert(err.message || "Failed to create assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Module Selector */}
      <div>
        <Dropdown
          label="Target Module"
          required
          options={moduleDropdownOptions}
          value={moduleId}
          onChange={(val) => {
            setModuleId(val);
            if (errors.moduleId) setErrors((prev) => ({ ...prev, moduleId: "" }));
          }}
          placeholder="Select academic module"
        />
        {errors.moduleId && (
          <p className="mt-1 text-xs text-rose-500 font-medium">{errors.moduleId}</p>
        )}
      </div>

      {/* Assessment Title */}
      <div>
        <Input
          label="Assessment Title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          placeholder="e.g. Midterm Coursework: Relational Schema Design"
          error={errors.title}
        />
      </div>

      {/* Deadline Datetime */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Submission Deadline <span className="text-rose-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: "" }));
          }}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition-all duration-200 focus:ring-2 ${
            errors.deadline
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
          }`}
        />
        {errors.deadline && (
          <p className="mt-1 text-xs text-rose-500 font-medium">{errors.deadline}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Submissions received past this timestamp will automatically be tagged as Late.
        </p>
      </div>

      {/* Footer Buttons take full width */}
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
          Create Assessment
        </Button>
      </div>
    </form>
  );
}
