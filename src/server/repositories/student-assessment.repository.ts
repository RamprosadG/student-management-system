import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  StudentAssessmentFilterParams,
  StudentAssessmentListResult,
  StudentAssessmentProfile,
  StudentAssessmentRow,
  StudentAssessmentSubmission,
  StudentAssessmentSummary,
} from "@/server/types/student-assessment";

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
          ? getLateDurationText(submittedAtDate, deadlineDate)
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
