import { Suspense } from "react";
import {
  StudentAssessmentsContent,
  StudentAssessmentsLoading,
} from "@/components/features/student/assessments/StudentAssessmentsContent";

export default function StudentAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StudentAssessmentsLoading />}>
        <StudentAssessmentsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
