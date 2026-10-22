import RefreshDashboardButton from "@/components/shared/RefreshDashboardButton";
import Badge from "@/components/ui/badges/Badge";
import type { StudentDashboardStudent } from "@/types/dashboard";

interface StudentDashboardHeroProps {
  student: StudentDashboardStudent | null;
  isLoading?: boolean;
}

export function StudentDashboardHero({
  student,
  isLoading = false,
}: StudentDashboardHeroProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/50 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
              Student Portal
            </span>
            <span className="text-xs font-mono text-slate-500">
              {student?.studentId || "SMS-STUDENT"}
            </span>
            {student && (
              <Badge
                variant={
                  student.status === "ENROLLED"
                    ? "success"
                    : student.status === "DEFERRED"
                      ? "warning"
                      : "neutral"
                }
                size="sm"
              >
                {student.status}
              </Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1 max-sm:text-lg">
            Welcome back, {student?.fullName || "Student"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-sm:hidden">
            {student
              ? `${student.programme.name} (${student.programme.code}) • Academic Year ${student.academicYear.name}`
              : "Your personal academic overview, fee status, and upcoming deadlines."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 max-sm:hidden">
          <RefreshDashboardButton isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
