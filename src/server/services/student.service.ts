import {
  findStaffStudentPage,
  findStaffStudentSummary,
  findStudentReferenceData,
  createStudentWithFee,
  updateStudentById,
  findStudentOptions,
  findFirstEnrolledStudentId,
} from "@/server/repositories/student.repository";
import { connection } from "next/server";
import {
  StaffStudentFilterParams,
  StaffStudentListQuery,
  StaffStudentListResult,
  StaffStudentReferenceData,
  StaffStudentSummary,
} from "@/server/types/student";
import { Prisma } from "@/generated/prisma/client";
import {
  CreateStudentInput,
  UpdateStudentInput,
} from "@/lib/validations/student";
import prisma from "@/lib/prisma";

const ENROLMENT_STATUSES = ["ENROLLED", "DEFERRED", "WITHDRAWN", "COMPLETED"];

function normalizeStatus(
  status?: string
): StaffStudentFilterParams["status"] | undefined {
  if (!status) return undefined;

  const match = ENROLMENT_STATUSES.find(
    (option) => option === status.toUpperCase()
  );

  return match ? (match as StaffStudentFilterParams["status"]) : undefined;
}

export async function getStaffStudents(
  query: StaffStudentListQuery
): Promise<StaffStudentListResult> {
  // Enrolment changes with every saved record, so never prerender this.
  await connection();

  const filters: StaffStudentFilterParams = {
    search: query.search,
    programmeId: query.programmeId,
    status: normalizeStatus(query.status),
    page: query.page,
    pageSize: query.pageSize,
  };

  return await findStaffStudentPage(filters);
}

export async function getStaffStudentSummary(): Promise<StaffStudentSummary> {
  // The KPI counters describe every student, not the current filter.
  await connection();

  return await findStaffStudentSummary();
}

export async function getStudentReferenceData(): Promise<StaffStudentReferenceData> {
  // Programmes and academic years are editable elsewhere, so read them live.
  await connection();

  return await findStudentReferenceData();
}

export async function listStudentOptions() {
  return findStudentOptions();
}

/**
 * Roles are simulated client-side, so an unset selection falls back to the
 * first enrolled student instead of failing the page.
 */
export async function resolveStudentId(
  studentId?: string | null
): Promise<string | null> {
  if (studentId) return studentId;

  return await findFirstEnrolledStudentId();
}

export async function enrolStudent(input: CreateStudentInput) {
  // Validate email uniqueness
  const existingEmail = await prisma.student.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new Error("A student with this email address already exists.");
  }

  return createStudentWithFee({
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    dateOfBirth: new Date(input.dateOfBirth),
    programmeId: input.programmeId,
    academicYearId: input.academicYearId,
    status: input.status,
  });
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
  // Check if student exists
  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  // If email changed, check uniqueness
  if (input.email && input.email.toLowerCase() !== student.email.toLowerCase()) {
    const existing = await prisma.student.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing && existing.id !== id) {
      throw new Error("A student with this email address already exists.");
    }
  }

  const updateData: Prisma.StudentUpdateInput = {};
  if (input.fullName !== undefined) updateData.fullName = input.fullName.trim();
  if (input.email !== undefined) updateData.email = input.email.trim().toLowerCase();
  if (input.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.dateOfBirth);
  if (input.status !== undefined) updateData.status = input.status;

  return updateStudentById(id, updateData);
}
