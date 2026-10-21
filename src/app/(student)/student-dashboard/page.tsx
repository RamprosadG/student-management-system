import { Suspense } from "react";
import {
  StudentDashboardContent,
  StudentDashboardLoading,
} from "@/components/features/student/dashboard/StudentDashboardContent";

export default function StudentDashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StudentDashboardLoading />}>
        <StudentDashboardContent />
      </Suspense>
    </div>
  );
}
