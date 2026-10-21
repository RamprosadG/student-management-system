import { cookies } from "next/headers";
import {
  getStudentAssessmentSummary,
  getStudentAssessments,
} from "@/server/services/assessment.service";
import { STUDENT_SELECTION_COOKIE } from "@/lib/student-selection";
import type { StudentAssessmentsData } from "@/types/assessments";
import { StudentAssessmentsView } from "./StudentAssessmentsView";

const emptyData: StudentAssessmentsData = {
  student: null,
  assessments: [],
  summary: {
    totalAssessments: 0,
    submittedCount: 0,
    pendingCount: 0,
    overdueCount: 0,
  },
  filters: { search: "", status: "ALL" },
};

export function StudentAssessmentsLoading() {
  return <StudentAssessmentsView data={emptyData} isLoading />;
}

interface StudentAssessmentsContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function StudentAssessmentsContent({
  searchParams,
}: StudentAssessmentsContentProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const selectedStudentId = cookieStore.get(STUDENT_SELECTION_COOKIE)?.value;

  const filters = {
    search: typeof query.search === "string" ? query.search : "",
    status:
      typeof query.status === "string" ? query.status.toUpperCase() : "ALL",
  };

  // The KPI counters are a separate, unfiltered read so they always describe the whole programme.
  const [list, summary] = await Promise.all([
    getStudentAssessments({
      studentId: selectedStudentId,
      search: filters.search || undefined,
      status: filters.status,
    }),
    getStudentAssessmentSummary(selectedStudentId),
  ]);

  const data: StudentAssessmentsData = {
    student: list.student,
    assessments: list.assessments,
    summary,
    filters,
  };

  return <StudentAssessmentsView data={data} />;
}
