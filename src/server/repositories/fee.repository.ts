import prisma from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import {
  StaffFeeFilterParams,
  StaffFeeListResult,
  StaffFeeRow,
  StaffFeeSummary,
} from "@/server/types/fee";

/**
 * Outstanding balance and status both depend on the sum of a fee's payments,
 * which Prisma cannot express in a where clause, so the ledger predicates are SQL.
 */
export async function findStaffFeePage(
  filters: StaffFeeFilterParams
): Promise<StaffFeeListResult> {
  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const pattern = filters.search ? `%${filters.search}%` : null;
  const statusFilter =
    filters.status && filters.status !== "ALL" ? filters.status : null;
  const now = new Date();

  const totals = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*)::int AS count
    FROM "StudentFee" sf
    JOIN "Student" st ON st."id" = sf."studentId"
    LEFT JOIN (
      SELECT "studentFeeId", SUM("amount") AS "paidTotal"
      FROM "Payment"
      GROUP BY "studentFeeId"
    ) pay ON pay."studentFeeId" = sf."id"
    WHERE (
      ${pattern}::text IS NULL
      OR st."fullName" ILIKE ${pattern}
      OR st."studentId" ILIKE ${pattern}
      OR st."email" ILIKE ${pattern}
    )
    AND (
      ${statusFilter}::text IS NULL
      OR CASE
        WHEN GREATEST(sf."amountDue" - COALESCE(pay."paidTotal", 0), 0) = 0 THEN 'PAID'
        WHEN sf."dueDate" < ${now} THEN 'OVERDUE'
        ELSE 'PARTIAL'
      END = ${statusFilter}
    )
  `;

  const total = Number(totals[0]?.count ?? 0);
  const page = buildPaginationMeta(filters.page, pageSize, total);

  if (total === 0) {
    return { items: [], pagination: page };
  }

  const pageIds = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT sf."id"
    FROM "StudentFee" sf
    JOIN "Student" st ON st."id" = sf."studentId"
    LEFT JOIN (
      SELECT "studentFeeId", SUM("amount") AS "paidTotal"
      FROM "Payment"
      GROUP BY "studentFeeId"
    ) pay ON pay."studentFeeId" = sf."id"
    WHERE (
      ${pattern}::text IS NULL
      OR st."fullName" ILIKE ${pattern}
      OR st."studentId" ILIKE ${pattern}
      OR st."email" ILIKE ${pattern}
    )
    AND (
      ${statusFilter}::text IS NULL
      OR CASE
        WHEN GREATEST(sf."amountDue" - COALESCE(pay."paidTotal", 0), 0) = 0 THEN 'PAID'
        WHEN sf."dueDate" < ${now} THEN 'OVERDUE'
        ELSE 'PARTIAL'
      END = ${statusFilter}
    )
    ORDER BY sf."createdAt" DESC
    LIMIT ${pageSize}
    OFFSET ${(page.page - 1) * pageSize}
  `;

  const fees = await prisma.studentFee.findMany({
    where: { id: { in: pageIds.map((row) => row.id) } },
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          programme: {
            select: {
              code: true,
              name: true,
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
  });

  const byId = new Map(fees.map((fee) => [fee.id, fee]));

  // Compute calculated financial ledger fields
  const items = pageIds
    .map((row) => byId.get(row.id))
    .filter((fee): fee is NonNullable<typeof fee> => Boolean(fee))
    .map<StaffFeeRow>((sf) => {
      const amountDue = Number(sf.amountDue);
      const totalPaid = sf.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const balance = Math.max(0, amountDue - totalPaid);
      const dueDate = new Date(sf.dueDate);

      let status: StaffFeeRow["status"];
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
        dueDate: sf.dueDate.toISOString(),
        status,
        payments: sf.payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          paidAt: p.paidAt.toISOString(),
          referenceNumber: p.referenceNumber,
        })),
      };
    });

  return { items, pagination: page };
}

/**
 * KPI totals for the whole ledger, deliberately ignoring every list filter.
 */
export async function findStaffFeeSummary(): Promise<StaffFeeSummary> {
  const rows = await prisma.$queryRaw<
    Array<{
      totalInvoiced: number;
      totalCollected: number;
      totalOutstanding: number;
      overdueCount: number;
    }>
  >`
    SELECT
      COALESCE(SUM(sf."amountDue"), 0)::float8 AS "totalInvoiced",
      COALESCE(SUM(COALESCE(pay."paidTotal", 0)), 0)::float8 AS "totalCollected",
      COALESCE(
        SUM(GREATEST(sf."amountDue" - COALESCE(pay."paidTotal", 0), 0)),
        0
      )::float8 AS "totalOutstanding",
      COUNT(*) FILTER (
        WHERE GREATEST(sf."amountDue" - COALESCE(pay."paidTotal", 0), 0) > 0
          AND sf."dueDate" < ${new Date()}
      )::int AS "overdueCount"
    FROM "StudentFee" sf
    LEFT JOIN (
      SELECT "studentFeeId", SUM("amount") AS "paidTotal"
      FROM "Payment"
      GROUP BY "studentFeeId"
    ) pay ON pay."studentFeeId" = sf."id"
  `;

  const summary = rows[0];

  return {
    totalInvoiced: Number(summary?.totalInvoiced ?? 0),
    totalCollected: Number(summary?.totalCollected ?? 0),
    totalOutstanding: Number(summary?.totalOutstanding ?? 0),
    overdueCount: Number(summary?.overdueCount ?? 0),
  };
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
