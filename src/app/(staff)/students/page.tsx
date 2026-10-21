import { Suspense } from "react";
import {
  StaffStudentsContent,
  StaffStudentsLoading,
} from "@/components/features/students/StaffStudentsContent";

export default function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StaffStudentsLoading />}>
        <StaffStudentsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
