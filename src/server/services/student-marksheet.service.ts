import { connection } from "next/server";
import {
  emptyStudentMarksheetStats,
  findStudentMarksheetRows,
  findStudentMarksheetStats,
} from "@/server/repositories/student-marksheet.repository";
import { resolveStudentId } from "@/server/services/student.service";
import {
  StudentMarksheetListResult,
  StudentMarksheetStats,
} from "@/server/types/student-marksheet";

export const emptyStudentMarksheetRows: StudentMarksheetListResult = {
  student: null,
  marksheet: [],
};

export async function getStudentMarksheet(
  studentId?: string | null
): Promise<StudentMarksheetListResult> {
  // The transcript belongs to whichever student the portal is impersonating.
  await connection();

  const resolvedId = await resolveStudentId(studentId);

  if (!resolvedId) {
    return emptyStudentMarksheetRows;
  }

  return await findStudentMarksheetRows(resolvedId);
}

export async function getStudentMarksheetStats(
  studentId?: string | null
): Promise<StudentMarksheetStats> {
  // Published averages follow every Registry action, not the rendered rows.
  await connection();

  const resolvedId = await resolveStudentId(studentId);

  if (!resolvedId) {
    return emptyStudentMarksheetStats;
  }

  return await findStudentMarksheetStats(resolvedId);
}
