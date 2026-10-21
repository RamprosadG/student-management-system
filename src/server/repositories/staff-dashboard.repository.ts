import prisma from "@/lib/prisma";
import { StaffDashboardMetrics } from "@/server/types/staff-dashboard";

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

export async function findStaffDashboardData(): Promise<StaffDashboardMetrics> {
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
  const overdueList: StaffDashboardMetrics["priorityOverdueStudents"] = [];

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
