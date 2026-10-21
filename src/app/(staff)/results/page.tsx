import { Suspense } from "react";
import {
  StaffResultsContent,
  StaffResultsLoading,
} from "@/components/features/results/StaffResultsContent";

export default function StaffResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StaffResultsLoading />}>
        <StaffResultsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
