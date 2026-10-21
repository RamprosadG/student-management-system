import { AssessmentsActions } from "./AssessmentsActions";
import { AssessmentsHeader } from "./AssessmentsHeader";
import { AssessmentsSummary } from "./AssessmentsSummary";
import { StaffAssessmentsSection } from "./StaffAssessmentsSection";
import type { StaffAssessmentsData } from "@/types/staff-assessments";

interface StaffAssessmentsViewProps {
  data: StaffAssessmentsData;
}

export function StaffAssessmentsView({ data }: StaffAssessmentsViewProps) {
  return (
    <>
      <AssessmentsHeader actions={<AssessmentsActions modules={data.modules} />} />
      <AssessmentsSummary summary={data.summary} />
      <StaffAssessmentsSection
        assessments={data.assessments}
        modules={data.modules}
        pagination={data.pagination}
        filters={data.filters}
      />
    </>
  );
}
