import { StudentMarksheetHeader } from "./StudentMarksheetHeader";
import { StudentMarksheetKpis } from "./StudentMarksheetKpis";
import { StudentMarksheetPolicyBanner } from "./StudentMarksheetPolicyBanner";
import { StudentMarksheetTable } from "./StudentMarksheetTable";
import type { StudentMarksheetData } from "@/types/results";

interface StudentMarksheetViewProps {
  data: StudentMarksheetData;
  isLoading?: boolean;
}

export function StudentMarksheetView({
  data,
  isLoading = false,
}: StudentMarksheetViewProps) {
  return (
    <>
      <StudentMarksheetHeader student={data.student} isLoading={isLoading} />

      <StudentMarksheetKpis stats={data.stats} />

      <StudentMarksheetPolicyBanner />

      <StudentMarksheetTable marksheet={data.marksheet} isLoading={isLoading} />
    </>
  );
}
