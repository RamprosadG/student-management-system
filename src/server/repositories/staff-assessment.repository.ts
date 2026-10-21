import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import {
  StaffAssessmentFilterParams,
  StaffAssessmentListResult,
  StaffAssessmentRow,
  StaffAssessmentSubmission,
  StaffAssessmentSummary,
} from "@/server/types/staff-assessment";

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

function getLateDurationText(submittedAt: Date, deadline: Date): string {
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
            ? getLateDurationText(submittedAt, deadlineDate)
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
