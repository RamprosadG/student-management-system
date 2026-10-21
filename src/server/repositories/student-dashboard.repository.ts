import prisma from "@/lib/prisma";
import { StudentDashboardMetrics } from "@/server/types/student-dashboard";

export const emptyStudentDashboardMetrics: StudentDashboardMetrics = {
  student: null,
  financialSummary: {
    amountDue: 0,
    totalPaid: 0,
    balance: 0,
    dueDate: null,
    status: "PAID",
    daysOverdue: 0,
    recentPayments: [],
  },
  academicProgress: {
    totalAssigned: 0,
    submittedCount: 0,
    pendingCount: 0,
    publishedCount: 0,
    averageGrade: null,
    overallClassification: null,
  },
  upcomingDeadlines: [],
};

export async function findStudentDashboardData(
  studentId: string
): Promise<StudentDashboardMetrics> {
  const now = new Date();

  // 1. Fetch Student profile & programme
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      programme: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      academicYear: {
        select: {
          name: true,
        },
      },
      studentFee: {
        include: {
          payments: {
            orderBy: { paidAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  if (!student) {
    return emptyStudentDashboardMetrics;
  }

  // 2. Compute Fee & Payment Summary
  const amountDue = student.studentFee ? Number(student.studentFee.amountDue) : 0;
  const totalPaid = student.studentFee
    ? student.studentFee.payments.reduce((acc, p) => acc + Number(p.amount), 0)
    : 0;
  const balance = Math.max(0, amountDue - totalPaid);
  const dueDate = student.studentFee ? new Date(student.studentFee.dueDate) : null;

  let feeStatus: "PAID" | "PARTIAL" | "OVERDUE" = "PAID";
  let daysOverdue = 0;

  if (balance === 0) {
    feeStatus = "PAID";
  } else if (dueDate && dueDate < now) {
    feeStatus = "OVERDUE";
    daysOverdue = Math.max(
      1,
      Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    );
  } else {
    feeStatus = "PARTIAL";
  }

  // 3. Fetch All Assessments & Submissions for this student's programme
  const assessments = await prisma.assessment.findMany({
    where: {
      module: {
        programmeId: student.programmeId,
      },
    },
    include: {
      module: true,
      submissions: {
        where: { studentId: student.id },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
          result: true,
        },
      },
    },
    orderBy: {
      deadline: "asc",
    },
  });

  let submittedCount = 0;
  let publishedCount = 0;
  let publishedGradeSum = 0;

  const upcomingDeadlines = assessments.map((a) => {
    const sub = a.submissions[0] || null;
    const latestVer = sub?.versions[0] || null;
    const result = sub?.result || null;

    if (sub) {
      submittedCount++;
    }

    if (result && result.isPublished) {
      publishedCount++;
      publishedGradeSum += Number(result.grade);
    }

    return {
      assessmentId: a.id,
      title: a.title,
      moduleCode: a.module.code,
      moduleTitle: a.module.title,
      deadline: a.deadline.toISOString(),
      isPastDeadline: new Date(a.deadline) < now,
      submission: sub && latestVer
        ? {
            id: sub.id,
            versionNumber: latestVer.versionNumber,
            submittedAt: latestVer.submittedAt.toISOString(),
            isLate: new Date(latestVer.submittedAt) > new Date(a.deadline),
          }
        : null,
    };
  });

  const totalAssigned = assessments.length;
  const pendingCount = totalAssigned - submittedCount;
  const averageGrade =
    publishedCount > 0 ? Number((publishedGradeSum / publishedCount).toFixed(1)) : null;

  let overallClassification: string | null = null;
  if (averageGrade !== null) {
    if (averageGrade >= 70) overallClassification = "Distinction";
    else if (averageGrade >= 60) overallClassification = "Merit";
    else if (averageGrade >= 40) overallClassification = "Pass";
    else overallClassification = "Fail";
  }

  return {
    student: {
      id: student.id,
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.email,
      status: student.status,
      programme: {
        id: student.programme.id,
        code: student.programme.code,
        name: student.programme.name,
      },
      academicYear: {
        name: student.academicYear.name,
      },
    },
    financialSummary: {
      amountDue,
      totalPaid,
      balance,
      dueDate: dueDate ? dueDate.toISOString() : null,
      status: feeStatus,
      daysOverdue,
      recentPayments: (student.studentFee?.payments || []).map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paidAt: p.paidAt.toISOString(),
        referenceNumber: p.referenceNumber,
      })),
    },
    academicProgress: {
      totalAssigned,
      submittedCount,
      pendingCount,
      publishedCount,
      averageGrade,
      overallClassification,
    },
    upcomingDeadlines,
  };
}
