import { StudentsActions } from "./StudentsActions";
import { StudentsHeader } from "./StudentsHeader";
import { StudentsSummary } from "./StudentsSummary";
import { StaffStudentsSection } from "./StaffStudentsSection";
import type { StaffStudentsData } from "@/types/students";

interface StaffStudentsViewProps {
  data: StaffStudentsData;
  isLoading?: boolean;
}

export function StaffStudentsView({
  data,
  isLoading = false,
}: StaffStudentsViewProps) {
  return (
    <>
      <StudentsHeader actions={<StudentsActions meta={data.meta} />} />
      <StudentsSummary summary={data.summary} />
      <StaffStudentsSection
        students={data.students}
        meta={data.meta}
        pagination={data.pagination}
        filters={data.filters}
        isLoading={isLoading}
      />
    </>
  );
}
