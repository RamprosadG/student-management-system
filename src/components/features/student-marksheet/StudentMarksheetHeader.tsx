import StudentMarksheetRefreshButton from "./StudentMarksheetRefreshButton";
import type { StudentMarksheetStudent } from "@/types/student-marksheet";

interface StudentMarksheetHeaderProps {
  student: StudentMarksheetStudent | null | undefined;
  isLoading?: boolean;
}

export function StudentMarksheetHeader({
  student,
  isLoading = false,
}: StudentMarksheetHeaderProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/40 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
              Official Registry Marksheet
            </span>
            <span className="text-xs font-mono text-slate-500">
              {student?.studentId || "SMS-STUDENT"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Academic Transcript & Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {student
              ? `${student.fullName} • ${student.programme.name} (${student.academicYear.name})`
              : "Official published grades and classifications certified by the Registry."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StudentMarksheetRefreshButton isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
