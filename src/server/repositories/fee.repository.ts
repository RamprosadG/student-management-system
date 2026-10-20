import prisma from "@/lib/prisma";
import { FeeFilterParams } from "@/server/types/fee";

export async function findFeesWithStudents(filters: FeeFilterParams) {
  const where: any = {};

  if (filters.search) {
    where.student = {
      OR: [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { studentId: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ],
    };
  }

  const studentFees = await prisma.studentFee.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          status: true,
          programme: {
            select: {
              code: true,
              name: true,
              standardFee: true,
            },
          },
          academicYear: {
            select: {
              name: true,
            },
          },
        },
      },
      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  // Compute calculated financial ledger fields
  const ledger = studentFees.map((sf) => {
    const amountDue = Number(sf.amountDue);
    const totalPaid = sf.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const balance = Math.max(0, amountDue - totalPaid);
    const dueDate = new Date(sf.dueDate);

    let status: "PAID" | "PARTIAL" | "OVERDUE";
    if (balance === 0) {
      status = "PAID";
    } else if (dueDate < now) {
      status = "OVERDUE";
    } else {
      status = "PARTIAL";
    }

    return {
      id: sf.id,
      studentId: sf.student.studentId,
      studentUuid: sf.student.id,
      fullName: sf.student.fullName,
      email: sf.student.email,
      programmeCode: sf.student.programme.code,
      programmeName: sf.student.programme.name,
      academicYear: sf.student.academicYear.name,
      amountDue,
      totalPaid,
      balance,
      dueDate: sf.dueDate,
      status,
      payments: sf.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paidAt: p.paidAt,
        referenceNumber: p.referenceNumber,
      })),
    };
  });

  // Apply optional memory filter for status if selected
  if (filters.status && filters.status !== "ALL") {
    return ledger.filter((item) => item.status === filters.status);
  }

  return ledger;
}

export async function findFeeById(feeId: string) {
  return prisma.studentFee.findUnique({
    where: { id: feeId },
    include: {
      student: true,
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });
}

export async function recordPaymentTransaction(data: {
  studentFeeId: string;
  amount: number;
  referenceNumber: string;
  paidAt?: Date;
}) {
  return prisma.$transaction(async (tx) => {
    // Check fee existence
    const fee = await tx.studentFee.findUniqueOrThrow({
      where: { id: data.studentFeeId },
      include: {
        payments: true,
      },
    });

    // Check duplicate reference number
    const existingRef = await tx.payment.findUnique({
      where: { referenceNumber: data.referenceNumber.trim() },
    });

    if (existingRef) {
      throw new Error(
        `Payment reference number "${data.referenceNumber}" already exists.`
      );
    }

    // Verify payment does not exceed current balance
    const currentPaid = fee.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const balance = Number(fee.amountDue) - currentPaid;

    if (data.amount > balance) {
      throw new Error(
        `Payment amount of ${data.amount.toFixed(
          2
        )} exceeds the outstanding balance of ${balance.toFixed(2)}.`
      );
    }

    // Create payment record
    const payment = await tx.payment.create({
      data: {
        studentFeeId: data.studentFeeId,
        amount: data.amount,
        referenceNumber: data.referenceNumber.trim(),
        paidAt: data.paidAt || new Date(),
      },
    });

    return payment;
  });
}
