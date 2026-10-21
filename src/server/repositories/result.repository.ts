import prisma from "@/lib/prisma";
import {
  SaveGradeInput,
  TogglePublishInput,
  getGradeClassification,
} from "@/lib/validations/result";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_PAGE_SIZE, buildPaginationMeta } from "@/lib/utils";
import {
  StaffResultFilterParams,
  StaffResultListResult,
  StaffResultRow,
  StaffResultSummary,
  StudentMarksheetItem,
  StudentMarksheetListResult,
  StudentMarksheetStats,
} from "@/server/types/result";

/**
 * Save or update grade for a submission (upsert)
 */
export async function saveOrUpdateGrade(input: SaveGradeInput) {
  const submission = await prisma.submission.findUnique({
    where: { id: input.submissionId },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const result = await prisma.assessmentResult.upsert({
    where: { submissionId: input.submissionId },
    create: {
      submissionId: input.submissionId,
      grade: input.grade,
      isPublished: input.isPublished ?? false,
    },
    update: {
      grade: input.grade,
      isPublished: input.isPublished ?? false,
      updatedAt: new Date(),
    },
  });

  return {
    id: result.id,
    submissionId: result.submissionId,
    grade: Number(result.grade),
    classification: getGradeClassification(Number(result.grade)),
    isPublished: result.isPublished,
    gradedAt: result.gradedAt,
  };
}

/**
 * Toggle publish or withhold status for a submission's result
 */
export async function setPublishStatus(input: TogglePublishInput) {
  const existingResult = await prisma.assessmentResult.findUnique({
    where: { submissionId: input.submissionId },
  });

  if (!existingResult) {
    throw new Error("Cannot toggle publication: No grade recorded for this submission yet");
  }

  const updated = await prisma.assessmentResult.update({
    where: { submissionId: input.submissionId },
    data: {
      isPublished: input.isPublished,
      updatedAt: new Date(),
    },
  });

  return {
    id: updated.id,
    submissionId: updated.submissionId,
    grade: Number(updated.grade),
    classification: getGradeClassification(Number(updated.grade)),
    isPublished: updated.isPublished,
  };
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

export const emptyStudentMarksheetStats: StudentMarksheetStats = {
  totalAssessments: 0,
  publishedResultsCount: 0,
  withheldOrPendingCount: 0,
  averageGrade: null,
  overallClassification: null,
};

function publishedResultsWhere(
  studentId: string,
  programmeId: string
): Prisma.AssessmentResultWhereInput {
  return {
    isPublished: true,
    submission: {
      studentId,
      assessment: { module: { programmeId } },
    },
  };
}

/**
 * The student's programme assessments with their own delivery and grade,
 * limited to the rows this transcript actually shows.
 */
export async function findStudentMarksheetRows(
  studentId: string
): Promise<StudentMarksheetListResult> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      programme: { select: { id: true, code: true, name: true } },
      academicYear: { select: { name: true } },
    },
  });

  if (!student) {
    return { student: null, marksheet: [] };
  }

  const assessments = await prisma.assessment.findMany({
    where: { module: { programmeId: student.programmeId } },
    include: {
      module: true,
      submissions: {
        where: { studentId: student.id },
        include: {
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
          result: true,
        },
      },
    },
    orderBy: { deadline: "asc" },
  });

  const marksheet = assessments.map<StudentMarksheetItem>((assessment) => {
    const submission = assessment.submissions[0] || null;
    const latestVersion = submission?.versions[0] || null;
    const result = submission?.result || null;

    let submissionData = null;
    if (submission && latestVersion) {
      const deadlineDate = new Date(assessment.deadline);
      const submittedAtDate = new Date(latestVersion.submittedAt);

      submissionData = {
        id: submission.id,
        fileName: latestVersion.fileName,
        submittedAt: latestVersion.submittedAt.toISOString(),
        isLate: submittedAtDate > deadlineDate,
        versionNumber: latestVersion.versionNumber,
      };
    }

    // STRICT REGISTRY RULE: Show grade ONLY IF result exists AND isPublished === true
    let resultData = null;
    let statusText = "Pending Submission";

    if (result && result.isPublished) {
      const numericGrade = Number(result.grade);
      resultData = {
        id: result.id,
        grade: numericGrade,
        classification: getGradeClassification(numericGrade),
        gradedAt: result.gradedAt.toISOString(),
      };
      statusText = "Grade Published";
    } else if (result && !result.isPublished) {
      statusText = "Result Withheld by Registry";
    } else if (submission) {
      statusText = "Awaiting Evaluation";
    }

    return {
      id: assessment.id,
      assessmentTitle: assessment.title,
      moduleCode: assessment.module.code,
      moduleTitle: assessment.module.title,
      deadline: assessment.deadline.toISOString(),
      submission: submissionData,
      result: resultData,
      hasSubmission: Boolean(submission),
      statusText,
    };
  });

  return {
    student: {
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
        name: student.academicYear.name,
      },
    },
    marksheet,
  };
}

/**
 * Transcript KPIs averaged by the database instead of over the loaded rows.
 */
export async function findStudentMarksheetStats(
  studentId: string
): Promise<StudentMarksheetStats> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { programmeId: true },
  });

  if (!student) {
    return emptyStudentMarksheetStats;
  }

  const where = publishedResultsWhere(studentId, student.programmeId);

  const [totalAssessments, publishedResultsCount, average] = await Promise.all([
    prisma.assessment.count({
      where: { module: { programmeId: student.programmeId } },
    }),
    prisma.assessmentResult.count({ where }),
    prisma.assessmentResult.aggregate({ _avg: { grade: true }, where }),
  ]);

  const averageGrade =
    average._avg.grade !== null
      ? Number(Number(average._avg.grade).toFixed(1))
      : null;

  return {
    totalAssessments,
    publishedResultsCount,
    withheldOrPendingCount: totalAssessments - publishedResultsCount,
    averageGrade,
    overallClassification:
      averageGrade !== null ? getGradeClassification(averageGrade) : null,
  };
}
