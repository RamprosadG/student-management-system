import { StudentAssessmentsHeader } from "./StudentAssessmentsHeader";
import { StudentAssessmentsKpis } from "./StudentAssessmentsKpis";
import { StudentAssessmentsSection } from "./StudentAssessmentsSection";
import type { StudentAssessmentsData } from "@/types/student-assessments";

interface StudentAssessmentsViewProps {
  data: StudentAssessmentsData;
  isLoading?: boolean;
}

export function StudentAssessmentsView({
  data,
  isLoading = false,
}: StudentAssessmentsViewProps) {
  return (
    <>
      <StudentAssessmentsHeader studentInfo={data.student} isLoading={isLoading} />
      <StudentAssessmentsKpis {...data.summary} />
      <StudentAssessmentsSection
        student={data.student}
        assessments={data.assessments}
        filters={data.filters}
      />
    </>
  );
}
