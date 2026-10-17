import {
  findStudents,
  createStudentWithFee,
  updateStudentById,
  getReferenceData,
  StudentFilterParams,
} from "@/server/repositories/student.repository";
import {
  CreateStudentInput,
  UpdateStudentInput,
} from "@/lib/validations/student";
import prisma from "@/lib/prisma";

export async function listStudents(filters: StudentFilterParams) {
  return findStudents(filters);
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

  const updateData: any = {};
  if (input.fullName !== undefined) updateData.fullName = input.fullName.trim();
  if (input.email !== undefined) updateData.email = input.email.trim().toLowerCase();
  if (input.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.dateOfBirth);
  if (input.status !== undefined) updateData.status = input.status;

  return updateStudentById(id, updateData);
}

export async function getEnrolmentReferenceData() {
  return getReferenceData();
}

