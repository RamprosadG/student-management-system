import prisma from "@/lib/prisma";
import { EnrolmentStatus } from "@/generated/prisma/client";
import { StudentFilterParams } from "@/server/types/student";

export async function findStudents(filters: StudentFilterParams) {
  const where: any = {};

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

  return prisma.student.findMany({
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
  data: {
    fullName?: string;
    email?: string;
    dateOfBirth?: Date;
    status?: EnrolmentStatus;
  }
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

export async function getReferenceData() {
  const [programmes, academicYears] = await Promise.all([
    prisma.programme.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      orderBy: { startDate: "desc" },
    }),
  ]);

  return { programmes, academicYears };
}

