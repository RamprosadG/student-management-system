import StudentAssessmentsRefreshButton from "./StudentAssessmentsRefreshButton";
import type { StudentInfo } from "@/types/student-assessments";

interface StudentAssessmentsHeaderProps {
  studentInfo: StudentInfo | null;
  isLoading?: boolean;
}

export function StudentAssessmentsHeader({
  studentInfo,
  isLoading = false,
}: StudentAssessmentsHeaderProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/40 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
              Student Portal
            </span>
            <span className="text-xs font-mono text-slate-500">
              {studentInfo?.studentId || "SMS-STUDENT"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Assessment Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {studentInfo
              ? `${studentInfo.fullName} • ${studentInfo.programme.name} (${studentInfo.academicYear.name})`
              : "Submit assignments, inspect version history, and upload revisions before deadlines."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StudentAssessmentsRefreshButton isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
