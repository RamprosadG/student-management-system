import { Suspense } from "react";
import {
  StudentMarksheetContent,
  StudentMarksheetLoading,
} from "@/components/features/student/marksheet/StudentMarksheetContent";

export default function MarksheetPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StudentMarksheetLoading />}>
        <StudentMarksheetContent />
      </Suspense>
    </div>
  );
}
