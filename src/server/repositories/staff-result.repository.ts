import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getGradeClassification } from "@/lib/validations/result";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import {
  StaffResultFilterParams,
  StaffResultListResult,
  StaffResultRow,
  StaffResultSummary,
} from "@/server/types/staff-result";

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

function buildStaffResultWhere(
  filters: StaffResultFilterParams
): Prisma.SubmissionWhereInput {
  const where: Prisma.SubmissionWhereInput = {};

  if (filters.search) {
    where.OR = [
      { student: { fullName: { contains: filters.search, mode: "insensitive" } } },
      { student: { studentId: { contains: filters.search, mode: "insensitive" } } },
      { assessment: { title: { contains: filters.search, mode: "insensitive" } } },
      {
        assessment: {
          module: { title: { contains: filters.search, mode: "insensitive" } },
        },
      },
      {
        assessment: {
          module: { code: { contains: filters.search, mode: "insensitive" } },
        },
      },
    ];
  }

  if (filters.moduleId) {
    where.assessment = { moduleId: filters.moduleId };
  }

  if (filters.publishStatus === "PUBLISHED") {
    where.result = { isPublished: true };
  } else if (filters.publishStatus === "WITHHELD") {
    where.result = { isPublished: false };
  } else if (filters.publishStatus === "UNGRADED") {
    where.result = null;
  }

  return where;
}

/**
 * One page of the grading ledger, filtered and paginated by the database.
 */
export async function findStaffResultPage(
  filters: StaffResultFilterParams
): Promise<StaffResultListResult> {
  const where = buildStaffResultWhere(filters);
  const pageSize = filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;

  const total = await prisma.submission.count({ where });
  const pagination = buildPaginationMeta(filters.page, pageSize, total);

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
        },
      },
      assessment: {
        include: {
          module: {
            include: {
              programme: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
      result: true,
      _count: {
        select: { versions: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (pagination.page - 1) * pageSize,
    take: pageSize,
  });

  const items = submissions.map<StaffResultRow>((submission) => {
    const latestVer = submission.versions[0];
    const deadline = new Date(submission.assessment.deadline);
    const submittedAt = latestVer
      ? new Date(latestVer.submittedAt)
      : new Date(submission.createdAt);
    const isLate = submittedAt > deadline;

    const gradeNumber = submission.result
      ? Number(submission.result.grade)
      : null;

    return {
      id: submission.id,
      submissionId: submission.id,
      studentId: submission.student.studentId,
      studentUuid: submission.student.id,
      studentName: submission.student.fullName,
      studentEmail: submission.student.email,
      assessmentId: submission.assessment.id,
      assessmentTitle: submission.assessment.title,
      deadline: submission.assessment.deadline.toISOString(),
      moduleCode: submission.assessment.module.code,
      moduleTitle: submission.assessment.module.title,
      programmeCode: submission.assessment.module.programme.code,
      programmeName: submission.assessment.module.programme.name,
      fileName: latestVer?.fileName || "submission",
      fileSize: latestVer?.fileSize || 0,
      fileUrl: latestVer?.storageKey || null,
      submittedAt: submittedAt.toISOString(),
      versionCount: submission._count.versions,
      latestVersionNumber: latestVer?.versionNumber || 1,
      isLate,
      lateDurationText: isLate
        ? getLateDurationText(submittedAt, deadline)
        : null,
      resultId: submission.result?.id || null,
      grade: gradeNumber,
      classification:
        gradeNumber !== null ? getGradeClassification(gradeNumber) : null,
      isPublished: submission.result ? submission.result.isPublished : false,
      gradedAt: submission.result
        ? submission.result.gradedAt.toISOString()
        : null,
    };
  });

  return { items, pagination };
}

/**
 * KPI counters for the whole ledger, deliberately ignoring every list filter.
 */
export async function findStaffResultSummary(): Promise<StaffResultSummary> {
  const [totalSubmissions, gradedCount, publishedCount] = await Promise.all([
    prisma.submission.count(),
    prisma.assessmentResult.count(),
    prisma.assessmentResult.count({ where: { isPublished: true } }),
  ]);

  return {
    totalSubmissions,
    gradedCount,
    publishedCount,
    withheldCount: gradedCount - publishedCount,
  };
}
