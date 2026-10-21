import { cookies } from "next/headers";
import {
  getStudentMarksheetStats,
  getStudentMarksheet,
} from "@/server/services/student-marksheet.service";
import { STUDENT_SELECTION_COOKIE } from "@/lib/student-selection";
import type { StudentMarksheetData } from "@/types/student-marksheet";
import { StudentMarksheetView } from "./StudentMarksheetView";

const emptyData: StudentMarksheetData = {
  student: null,
  marksheet: [],
  stats: {
    totalAssessments: 0,
    publishedResultsCount: 0,
    withheldOrPendingCount: 0,
    averageGrade: null,
    overallClassification: null,
  },
};

export function StudentMarksheetLoading() {
  return <StudentMarksheetView data={emptyData} isLoading />;
}

export async function StudentMarksheetContent() {
  const cookieStore = await cookies();
  const selectedStudentId = cookieStore.get(STUDENT_SELECTION_COOKIE)?.value;

  // The KPI counters are a separate read so they always describe the whole transcript.
  const [list, stats] = await Promise.all([
    getStudentMarksheet(selectedStudentId),
    getStudentMarksheetStats(selectedStudentId),
  ]);

  const data: StudentMarksheetData = {
    student: list.student,
    marksheet: list.marksheet,
    stats,
  };

  return <StudentMarksheetView data={data} />;
}
