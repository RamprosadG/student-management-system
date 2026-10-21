import { Suspense } from "react";
import {
  StaffFeesContent,
  StaffFeesLoading,
} from "@/components/features/staff/fees/StaffFeesContent";

export default function StaffFeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StaffFeesLoading />}>
        <StaffFeesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
