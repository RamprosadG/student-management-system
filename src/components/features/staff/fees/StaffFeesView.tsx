import { FeesHeader } from "./FeesHeader";
import { FeesSummary } from "./FeesSummary";
import { StaffFeesSection } from "./StaffFeesSection";
import type { StaffFeesData } from "@/types/fees";

interface StaffFeesViewProps {
  data: StaffFeesData;
  isLoading?: boolean;
}

export function StaffFeesView({
  data,
  isLoading = false,
}: StaffFeesViewProps) {
  return (
    <>
      <FeesHeader />
      <FeesSummary summary={data.summary} />
      <StaffFeesSection
        ledger={data.ledger}
        pagination={data.pagination}
        filters={data.filters}
        isLoading={isLoading}
      />
    </>
  );
}
