import { ResultsHeader } from "./ResultsHeader";
import { ResultsSummary } from "./ResultsSummary";
import { StaffResultsSection } from "./StaffResultsSection";
import type { StaffResultsData } from "@/types/results";

interface StaffResultsViewProps {
  data: StaffResultsData;
  isLoading?: boolean;
}

export function StaffResultsView({
  data,
  isLoading = false,
}: StaffResultsViewProps) {
  return (
    <>
      <ResultsHeader />
      <ResultsSummary
        totalSubmissions={data.summary.totalSubmissions}
        gradedCount={data.summary.gradedCount}
        publishedCount={data.summary.publishedCount}
        withheldCount={data.summary.withheldCount}
      />
      <StaffResultsSection
        items={data.items}
        modules={data.modules}
        pagination={data.pagination}
        filters={data.filters}
        isLoading={isLoading}
      />
    </>
  );
}
