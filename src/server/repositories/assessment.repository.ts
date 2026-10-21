import prisma from "@/lib/prisma";
import { CreateAssessmentInput } from "@/lib/validations/assessment";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import {
  StaffAssessmentFilterParams,
  StaffAssessmentListResult,
  StaffAssessmentRow,
  StaffAssessmentSubmission,
  StaffAssessmentSummary,
  StudentAssessmentFilterParams,
  StudentAssessmentListResult,
  StudentAssessmentProfile,
  StudentAssessmentRow,
  StudentAssessmentSubmission,
  StudentAssessmentSummary,
} from "@/server/types/assessment";

export async function createAssessmentRecord(data: CreateAssessmentInput) {
  return prisma.assessment.create({
    data: {
      moduleId: data.moduleId,
      title: data.title.trim(),
      deadline: new Date(data.deadline),
    },
    include: {
      module: {
        include: {
          programme: true,
        },
      },
    },
  });
}

function buildStaffAssessmentWhere(
  filters: StaffAssessmentFilterParams
): Prisma.AssessmentWhereInput {
  const where: Prisma.AssessmentWhereInput = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { module: { title: { contains: filters.search, mode: "insensitive" } } },
      { module: { code: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  if (filters.moduleId) {
    where.moduleId = filters.moduleId;
  }

  if (filters.programmeId) {
    where.module = { programmeId: filters.programmeId };
  }

  return where;
}

function getStaffLateDurationText(submittedAt: Date, deadline: Date): string {
  const diffMs = submittedAt.getTime() - deadline.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Late by ${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `Late by ${hours}h ${mins}m`;
  }
  return `Late by ${Math.max(1, mins)}m`;
}

/**
 * Resolve one page of assessments, filtered and paginated by the database.
 */
export async function findStaffAssessmentPage(
  filters: StaffAssessmentFilterParams
): Promise<StaffAssessmentListResult> {
  const where = buildStaffAssessmentWhere(filters);
  const pageSize =
    filters.pageSize && filters.pageSize > 0
      ? filters.pageSize
      : DEFAULT_PAGE_SIZE;

  const total = await prisma.assessment.count({ where });
  const pagination = buildPaginationMeta(filters.page ?? 1, pageSize, total);

  const records = await prisma.assessment.findMany({
    where,
    include: {
      module: {
        include: {
          programme: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              fullName: true,
              email: true,
            },
          },
          versions: {
            orderBy: {
              versionNumber: "desc",
            },
          },
          result: {
            select: {
              id: true,
              grade: true,
              isPublished: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      deadline: "asc",
    },
    skip: (pagination.page - 1) * pageSize,
    take: pageSize,
  });

  const now = new Date();

  const assessments = records.map<StaffAssessmentRow>((assessment) => {
    const deadlineDate = new Date(assessment.deadline);
    const isPastDeadline = deadlineDate < now;

    const formattedSubmissions = assessment.submissions.map<StaffAssessmentSubmission>(
      (sub) => {
        const latestVersion = sub.versions[0] || null;
        const submittedAt = latestVersion
          ? new Date(latestVersion.submittedAt)
          : new Date(sub.createdAt);
        const isLate = submittedAt > deadlineDate;

        return {
          id: sub.id,
          studentId: sub.student.studentId,
          studentName: sub.student.fullName,
          studentEmail: sub.student.email,
          versionCount: sub.versions.length,
          latestVersionNumber: latestVersion ? latestVersion.versionNumber : 1,
          fileName: latestVersion?.fileName || "submission",
          fileSize: latestVersion?.fileSize || 0,
          fileUrl: latestVersion?.storageKey || null,
          submittedAt: submittedAt.toISOString(),
          isLate,
          lateDurationText: isLate
            ? getStaffLateDurationText(submittedAt, deadlineDate)
            : null,
          result: sub.result
            ? {
                id: sub.result.id,
                grade: Number(sub.result.grade),
                isPublished: sub.result.isPublished,
              }
            : null,
        };
      }
    );

    const totalSubmissions = formattedSubmissions.length;
    const lateSubmissionsCount = formattedSubmissions.filter(
      (s) => s.isLate
    ).length;

    return {
      id: assessment.id,
      title: assessment.title,
      deadline: assessment.deadline.toISOString(),
      isPastDeadline,
      createdAt: assessment.createdAt.toISOString(),
      module: {
        id: assessment.module.id,
        code: assessment.module.code,
        title: assessment.module.title,
        programme: {
          id: assessment.module.programme.id,
          code: assessment.module.programme.code,
          name: assessment.module.programme.name,
        },
      },
      stats: {
        totalSubmissions,
        onTimeSubmissionsCount: totalSubmissions - lateSubmissionsCount,
        lateSubmissionsCount,
      },
      submissions: formattedSubmissions,
    };
  });

  return { assessments, pagination };
}

/**
 * KPI counters for the whole portal, deliberately ignoring every list filter.
 */
export async function findStaffAssessmentSummary(): Promise<StaffAssessmentSummary> {
  const [totalAssessments, totalSubmissions, lateRows] = await Promise.all([
    prisma.assessment.count(),
    prisma.submission.count(),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) AS count
      FROM "Submission" s
      JOIN "Assessment" a ON a.id = s."assessmentId"
      LEFT JOIN (
        SELECT "submissionId", MAX("submittedAt") AS "latestSubmittedAt"
        FROM "SubmissionVersion"
        GROUP BY "submissionId"
      ) lv ON lv."submissionId" = s.id
      WHERE COALESCE(lv."latestSubmittedAt", s."createdAt") > a."deadline"
    `,
  ]);

  return {
    totalAssessments,
    totalSubmissions,
    totalLateSubmissions: Number(lateRows[0]?.count ?? 0),
  };
}

/**
 * A submission only counts as delivered once it has at least one version, so
 * every status filter has to express that same rule inside the query.
 */
function deliveredBy(studentId: string) {
  return {
    studentId,
    versions: { some: {} },
  };
}

function getStudentLateDurationText(submittedAt: Date, deadline: Date): string {
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

async function findStudentProfile(
  studentId: string
): Promise<StudentAssessmentProfile | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      programme: { select: { id: true, code: true, name: true } },
      academicYear: { select: { id: true, name: true } },
    },
  });

  if (!student) return null;

  return {
    id: student.id,
    studentId: student.studentId,
    fullName: student.fullName,
    email: student.email,
    programme: {
      id: student.programme.id,
      code: student.programme.code,
      name: student.programme.name,
    },
    academicYear: {
      id: student.academicYear.id,
      name: student.academicYear.name,
    },
  };
}

/**
 * Assessments whose newest upload landed after the deadline. Comparing a
 * version timestamp with the parent deadline needs SQL.
 */
async function findLateSubmittedAssessmentIds(
  studentId: string
): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT a.id
    FROM "Assessment" a
    JOIN "Submission" s ON s."assessmentId" = a.id AND s."studentId" = ${studentId}
    JOIN "SubmissionVersion" v ON v."submissionId" = s.id
    GROUP BY a.id, a."deadline"
    HAVING MAX(v."submittedAt") > a."deadline"
  `;

  return rows.map((row) => row.id);
}

/**
 * The student's programme assessments, with search and status resolved by the
 * database so only the matching rows are ever loaded.
 */
export async function findStudentAssessmentList(
  filters: StudentAssessmentFilterParams
): Promise<StudentAssessmentListResult> {
  const profile = await findStudentProfile(filters.studentId);

  if (!profile) {
    return { student: null, assessments: [] };
  }

  const now = new Date();
  const and: Prisma.AssessmentWhereInput[] = [
    { module: { programmeId: profile.programme.id } },
  ];

  if (filters.search) {
    and.push({
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { module: { title: { contains: filters.search, mode: "insensitive" } } },
        { module: { code: { contains: filters.search, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.status === "PENDING") {
    and.push({ submissions: { none: deliveredBy(filters.studentId) } });
  } else if (filters.status === "SUBMITTED") {
    and.push({ submissions: { some: deliveredBy(filters.studentId) } });
  } else if (filters.status === "LATE") {
    const lateIds = await findLateSubmittedAssessmentIds(filters.studentId);

    and.push({
      OR: [
        { id: { in: lateIds } },
        {
          deadline: { lt: now },
          submissions: { none: deliveredBy(filters.studentId) },
        },
      ],
    });
  }

  const records = await prisma.assessment.findMany({
    where: { AND: and },
    include: {
      module: {
        include: {
          programme: { select: { id: true, code: true, name: true } },
        },
      },
      submissions: {
        where: { studentId: filters.studentId },
        include: {
          versions: { orderBy: { versionNumber: "desc" } },
          result: { select: { id: true, grade: true, isPublished: true } },
        },
      },
    },
    orderBy: { deadline: "asc" },
  });

  const assessments = records.map<StudentAssessmentRow>((assessment) => {
    const deadlineDate = new Date(assessment.deadline);
    const submission = assessment.submissions[0] || null;

    let submissionData: StudentAssessmentSubmission | null = null;

    if (submission && submission.versions.length > 0) {
      const latestVer = submission.versions[0];
      const submittedAtDate = new Date(latestVer.submittedAt);
      const isLate = submittedAtDate > deadlineDate;

      submissionData = {
        id: submission.id,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        latestVersionNumber: latestVer.versionNumber,
        totalVersions: submission.versions.length,
        fileName: latestVer.fileName,
        fileSize: latestVer.fileSize,
        storageKey: latestVer.storageKey,
        mimeType: latestVer.mimeType,
        submittedAt: latestVer.submittedAt.toISOString(),
        isLate,
        lateDurationText: isLate
          ? getStudentLateDurationText(submittedAtDate, deadlineDate)
          : null,
        versions: submission.versions.map((version) => ({
          id: version.id,
          versionNumber: version.versionNumber,
          fileName: version.fileName,
          fileSize: version.fileSize,
          mimeType: version.mimeType,
          submittedAt: version.submittedAt.toISOString(),
          isLate: new Date(version.submittedAt) > deadlineDate,
        })),
        result: submission.result
          ? {
              id: submission.result.id,
              grade: Number(submission.result.grade),
              isPublished: submission.result.isPublished,
            }
          : null,
      };
    }

    return {
      id: assessment.id,
      title: assessment.title,
      deadline: assessment.deadline.toISOString(),
      isPastDeadline: deadlineDate < now,
      createdAt: assessment.createdAt.toISOString(),
      module: {
        id: assessment.module.id,
        code: assessment.module.code,
        title: assessment.module.title,
        programme: {
          id: assessment.module.programme.id,
          code: assessment.module.programme.code,
          name: assessment.module.programme.name,
        },
      },
      submission: submissionData,
    };
  });

  return { student: profile, assessments };
}

/**
 * KPI counters across every assessment in the programme, ignoring search and
 * status so the cards stay stable while the list is filtered.
 */
export async function findStudentAssessmentSummary(
  studentId: string
): Promise<StudentAssessmentSummary> {
  const profile = await findStudentProfile(studentId);

  if (!profile) {
    return {
      totalAssessments: 0,
      submittedCount: 0,
      pendingCount: 0,
      overdueCount: 0,
    };
  }

  const scope = { module: { programmeId: profile.programme.id } };

  const [totalAssessments, submittedCount, overdueCount] = await Promise.all([
    prisma.assessment.count({ where: scope }),
    prisma.assessment.count({
      where: { ...scope, submissions: { some: deliveredBy(studentId) } },
    }),
    prisma.assessment.count({
      where: {
        ...scope,
        deadline: { lt: new Date() },
        submissions: { none: deliveredBy(studentId) },
      },
    }),
  ]);

  return {
    totalAssessments,
    submittedCount,
    pendingCount: totalAssessments - submittedCount,
    overdueCount,
  };
}
