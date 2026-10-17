import prisma from "@/lib/prisma";

export interface DashboardMetrics {
  kpis: {
    totalStudents: number;
    enrolledStudents: number;
    totalOutstandingBalance: number;
    overdueAccountsCount: number;
    totalAssessments: number;
    pendingGradingCount: number;
  };
  priorityOverdueStudents: Array<{
    studentFeeId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    programmeCode: string;
    amountDue: number;
    totalPaid: number;
    balance: number;
    dueDate: string;
    daysOverdue: number;
  }>;
  recentSubmissions: Array<{
    submissionId: string;
    studentName: string;
    studentId: string;
    assessmentTitle: string;
    moduleCode: string;
    fileName: string;
    submittedAt: string;
    isLate: boolean;
    lateDurationText: string | null;
    versionNumber: number;
    grade: number | null;
    isPublished: boolean;
  }>;
  upcomingDeadlines: Array<{
    assessmentId: string;
    title: string;
    moduleCode: string;
    moduleTitle: string;
    programmeCode: string;
    deadline: string;
    isPastDeadline: boolean;
    submissionCount: number;
  }>;
}

function getLateDurationText(submittedAt: Date, deadline: Date): string {
  const diffMs = submittedAt.getTime() - deadline.getTime();
  if (diffMs <= 0) return "";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
  const minutes = diffMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return `Late by ${parts.join(" ")}`;
}

export async function findStaffDashboardData(): Promise<DashboardMetrics> {
  const now = new Date();

  // 1. Fetch Students count
  const [totalStudents, enrolledStudents] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: "ENROLLED" } }),
  ]);

  // 2. Fetch Fee Records with Payments
  const studentFees = await prisma.studentFee.findMany({
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          programme: { select: { code: true } },
        },
      },
      payments: {
        select: { amount: true },
      },
    },
  });

  let totalOutstandingBalance = 0;
  let overdueAccountsCount = 0;
  const overdueList: DashboardMetrics["priorityOverdueStudents"] = [];

  for (const sf of studentFees) {
    const amountDue = Number(sf.amountDue);
    const totalPaid = sf.payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const balance = Math.max(0, amountDue - totalPaid);
    const dueDate = new Date(sf.dueDate);

    if (balance > 0) {
      totalOutstandingBalance += balance;
      if (dueDate < now) {
        overdueAccountsCount++;
        const daysOverdue = Math.max(
          1,
          Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        );
        overdueList.push({
          studentFeeId: sf.id,
          studentId: sf.student.studentId,
          studentName: sf.student.fullName,
          studentEmail: sf.student.email,
          programmeCode: sf.student.programme.code,
          amountDue,
          totalPaid,
          balance,
          dueDate: sf.dueDate.toISOString(),
          daysOverdue,
        });
      }
    }
  }

  // Sort priority overdue students by highest balance and oldest due date
  overdueList.sort((a, b) => b.balance - a.balance);

  // 3. Submissions & Grading Counts
  const [totalAssessments, submissionsWithoutResults, recentSubmissionsRaw] = await Promise.all([
    prisma.assessment.count(),
    prisma.submission.count({
      where: {
        result: null,
      },
    }),
    prisma.submission.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            studentId: true,
            fullName: true,
          },
        },
        assessment: {
          include: {
            module: { select: { code: true } },
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        result: {
          select: {
            grade: true,
            isPublished: true,
          },
        },
      },
    }),
  ]);

  const recentSubmissions = recentSubmissionsRaw.map((sub) => {
    const latestVer = sub.versions[0];
    const deadline = new Date(sub.assessment.deadline);
    const submittedAt = latestVer ? new Date(latestVer.submittedAt) : new Date(sub.createdAt);
    const isLate = submittedAt > deadline;

    return {
      submissionId: sub.id,
      studentName: sub.student.fullName,
      studentId: sub.student.studentId,
      assessmentTitle: sub.assessment.title,
      moduleCode: sub.assessment.module.code,
      fileName: latestVer?.fileName || "Submission file",
      submittedAt: submittedAt.toISOString(),
      isLate,
      lateDurationText: isLate ? getLateDurationText(submittedAt, deadline) : null,
      versionNumber: latestVer?.versionNumber || 1,
      grade: sub.result ? Number(sub.result.grade) : null,
      isPublished: sub.result ? sub.result.isPublished : false,
    };
  });

  // 4. Upcoming Deadlines
  const upcomingAssessmentsRaw = await prisma.assessment.findMany({
    take: 5,
    orderBy: { deadline: "asc" },
    include: {
      module: {
        include: {
          programme: { select: { code: true } },
        },
      },
      submissions: {
        select: { id: true },
      },
    },
  });

  const upcomingDeadlines = upcomingAssessmentsRaw.map((a) => ({
    assessmentId: a.id,
    title: a.title,
    moduleCode: a.module.code,
    moduleTitle: a.module.title,
    programmeCode: a.module.programme.code,
    deadline: a.deadline.toISOString(),
    isPastDeadline: new Date(a.deadline) < now,
    submissionCount: a.submissions.length,
  }));

  return {
    kpis: {
      totalStudents,
      enrolledStudents,
      totalOutstandingBalance,
      overdueAccountsCount,
      totalAssessments,
      pendingGradingCount: submissionsWithoutResults,
    },
    priorityOverdueStudents: overdueList.slice(0, 5),
    recentSubmissions,
    upcomingDeadlines,
  };
}

export interface StudentDashboardMetrics {
  student: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    status: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
    academicYear: {
      name: string;
    };
  } | null;
  financialSummary: {
    amountDue: number;
    totalPaid: number;
    balance: number;
    dueDate: string | null;
    status: "PAID" | "PARTIAL" | "OVERDUE";
    daysOverdue: number;
    recentPayments: Array<{
      id: string;
      amount: number;
      paidAt: string;
      referenceNumber: string;
    }>;
  };
  academicProgress: {
    totalAssigned: number;
    submittedCount: number;
    pendingCount: number;
    publishedCount: number;
    averageGrade: number | null;
    overallClassification: string | null;
  };
  upcomingDeadlines: Array<{
    assessmentId: string;
    title: string;
    moduleCode: string;
    moduleTitle: string;
    deadline: string;
    isPastDeadline: boolean;
    submission: {
      id: string;
      versionNumber: number;
      submittedAt: string;
      isLate: boolean;
    } | null;
  }>;
}

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
    return {
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
