import prisma from "@/lib/prisma";
import { EnrolmentStatus, Prisma } from "@/generated/prisma/client";
import {
  StaffStudentFilterParams,
  StaffStudentListResult,
  StaffStudentReferenceData,
  StaffStudentRow,
  StaffStudentSummary,
} from "@/server/types/student";
import {
  DEFAULT_PAGE_SIZE,
  buildPaginationMeta,
} from "@/lib/utils";

/**
 * Search, programme and status predicates run in PostgreSQL and only the
 * requested page of rows is fetched.
 */
export async function findStaffStudentPage(
  filters: StaffStudentFilterParams
): Promise<StaffStudentListResult> {
  const where: Prisma.StudentWhereInput = {};

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { studentId: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.programmeId) {
    where.programmeId = filters.programmeId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const pageSize =
    filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const total = await prisma.student.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);
  const skip = (pagination.page - 1) * pageSize;

  const students = await prisma.student.findMany({
    where,
    include: {
      programme: {
        select: {
          id: true,
          code: true,
          name: true,
          standardFee: true,
        },
      },
      academicYear: {
        select: {
          id: true,
          name: true,
        },
      },
      studentFee: {
        select: {
          id: true,
          amountDue: true,
          dueDate: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  const items = students.map<StaffStudentRow>((student) => ({
    id: student.id,
    studentId: student.studentId,
    fullName: student.fullName,
    email: student.email,
    dateOfBirth: student.dateOfBirth.toISOString(),
    status: student.status,
    createdAt: student.createdAt.toISOString(),
    programme: {
      id: student.programme.id,
      code: student.programme.code,
      name: student.programme.name,
      standardFee: Number(student.programme.standardFee),
    },
    academicYear: {
      id: student.academicYear.id,
      name: student.academicYear.name,
    },
    studentFee: student.studentFee
      ? {
          id: student.studentFee.id,
          amountDue: Number(student.studentFee.amountDue),
          dueDate: student.studentFee.dueDate.toISOString(),
        }
      : null,
  }));

  return { items, pagination };
}

/**
 * KPI counters for the whole registry, deliberately ignoring every list filter.
 */
export async function findStaffStudentSummary(): Promise<StaffStudentSummary> {
  const grouped = await prisma.student.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const countByStatus = (status: EnrolmentStatus) =>
    grouped.find((row) => row.status === status)?._count._all ?? 0;

  return {
    enrolled: countByStatus("ENROLLED"),
    deferred: countByStatus("DEFERRED"),
    withdrawn: countByStatus("WITHDRAWN"),
    completed: countByStatus("COMPLETED"),
  };
}

/**
 * Fallback student for every student-scoped page while nobody is impersonated.
 */
export async function findFirstEnrolledStudentId(): Promise<string | null> {
  const first = await prisma.student.findFirst({
    where: { status: "ENROLLED" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return first?.id ?? null;
}

export async function findStudentOptions() {
  return prisma.student.findMany({
    select: {
      id: true,
      studentId: true,
      fullName: true,
      programme: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      studentId: "asc",
    },
  });
}

export async function getNextStudentSequence(year: number): Promise<string> {
  // Pattern: SMS-YYYY-XXXX (e.g. SMS-2025-0001)
  const prefix = `SMS-${year}-`;
  const latestStudent = await prisma.student.findFirst({
    where: {
      studentId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      studentId: "desc",
    },
    select: {
      studentId: true,
    },
  });

  if (!latestStudent) {
    return `${prefix}0001`;
  }

  const parts = latestStudent.studentId.split("-");
  const lastNumber = parseInt(parts[parts.length - 1], 10);
  const nextNum = isNaN(lastNumber) ? 1 : lastNumber + 1;
  return `${prefix}${nextNum.toString().padStart(4, "0")}`;
}

export async function createStudentWithFee(data: {
  fullName: string;
  email: string;
  dateOfBirth: Date;
  programmeId: string;
  academicYearId: string;
  status: EnrolmentStatus;
}) {
  const currentYear = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    // Generate sequential ID
    const studentId = await getNextStudentSequence(currentYear);

    // Fetch programme for fee
    const programme = await tx.programme.findUniqueOrThrow({
      where: { id: data.programmeId },
    });

    // Create student
    const student = await tx.student.create({
      data: {
        studentId,
        fullName: data.fullName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        programmeId: data.programmeId,
        academicYearId: data.academicYearId,
        status: data.status,
      },
    });

    // Automatically assign standard programme fee due in 30 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    await tx.studentFee.create({
      data: {
        studentId: student.id,
        amountDue: programme.standardFee,
        dueDate,
      },
    });

    return tx.student.findUniqueOrThrow({
      where: { id: student.id },
      include: {
        programme: true,
        academicYear: true,
        studentFee: true,
      },
    });
  });
}

export async function updateStudentById(
  id: string,
  data: Prisma.StudentUpdateInput
) {
  return prisma.student.update({
    where: { id },
    data,
    include: {
      programme: true,
      academicYear: true,
      studentFee: true,
    },
  });
}

export async function findStudentReferenceData(): Promise<StaffStudentReferenceData> {
  const [programmes, academicYears] = await Promise.all([
    prisma.programme.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
    prisma.academicYear.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return { programmes, academicYears };
}

