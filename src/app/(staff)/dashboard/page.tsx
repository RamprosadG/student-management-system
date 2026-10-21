import { Suspense } from "react";
import {
  StaffDashboardContent,
  StaffDashboardLoading,
} from "@/components/features/dashboard/StaffDashboardContent";

export default function StaffDashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<StaffDashboardLoading />}>
        <StaffDashboardContent />
      </Suspense>
    </div>
  );
}
