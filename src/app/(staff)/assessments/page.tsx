import { Suspense } from "react";
import {
  StaffAssessmentsContent,
  StaffAssessmentsLoading,
} from "@/components/features/staff/assessments/StaffAssessmentsContent";

export default function StaffAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StaffAssessmentsLoading />}>
        <StaffAssessmentsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
