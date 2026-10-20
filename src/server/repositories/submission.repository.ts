import prisma from "@/lib/prisma";
import { CreateSubmissionInput } from "@/lib/validations/submission";
import { StudentAssessmentItem } from "@/server/types/submission";

/**
 * Calculates late duration text if submitted after deadline
 */
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

/**
 * Find all assessments for a student's enrolled programme with their submission status and versions
 */
export async function findAssessmentsForStudent(
  studentId: string,
  search?: string
): Promise<{
  student: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
    academicYear: {
      id: string;
      name: string;
    };
  } | null;
  assessments: StudentAssessmentItem[];
}> {
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
          id: true,
          name: true,
        },
      },
    },
  });

  if (!student) {
    return { student: null, assessments: [] };
  }

  // Get all assessments in modules under student's programme
  const assessmentWhere: any = {
    module: {
      programmeId: student.programmeId,
    },
  };

  if (search) {
    assessmentWhere.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { module: { title: { contains: search, mode: "insensitive" } } },
      { module: { code: { contains: search, mode: "insensitive" } } },
    ];
  }

  const rawAssessments = await prisma.assessment.findMany({
    where: assessmentWhere,
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
        where: {
          studentId: student.id,
        },
        include: {
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
      },
    },
    orderBy: {
      deadline: "asc",
    },
  });

  const now = new Date();

  const assessments: StudentAssessmentItem[] = rawAssessments.map((a) => {
    const isPastDeadline = new Date(a.deadline) < now;
    const sub = a.submissions[0] || null;

    let submissionData: StudentAssessmentItem["submission"] = null;

    if (sub && sub.versions.length > 0) {
      const latestVer = sub.versions[0];
      const submittedAtDate = new Date(latestVer.submittedAt);
      const deadlineDate = new Date(a.deadline);
      const isLate = submittedAtDate > deadlineDate;

      submissionData = {
        id: sub.id,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
        latestVersionNumber: latestVer.versionNumber,
        totalVersions: sub.versions.length,
        fileName: latestVer.fileName,
        fileSize: latestVer.fileSize,
        storageKey: latestVer.storageKey,
        mimeType: latestVer.mimeType,
        submittedAt: latestVer.submittedAt.toISOString(),
        isLate,
        lateDurationText: isLate
          ? getLateDurationText(submittedAtDate, deadlineDate)
          : null,
        versions: sub.versions.map((v) => {
          const vDate = new Date(v.submittedAt);
          const vIsLate = vDate > deadlineDate;
          return {
            id: v.id,
            versionNumber: v.versionNumber,
            fileName: v.fileName,
            fileSize: v.fileSize,
            mimeType: v.mimeType,
            submittedAt: v.submittedAt.toISOString(),
            isLate: vIsLate,
          };
        }),
        result: sub.result
          ? {
              id: sub.result.id,
              grade: Number(sub.result.grade),
              isPublished: sub.result.isPublished,
            }
          : null,
      };
    }

    return {
      id: a.id,
      title: a.title,
      deadline: a.deadline.toISOString(),
      isPastDeadline,
      createdAt: a.createdAt.toISOString(),
      module: {
        id: a.module.id,
        code: a.module.code,
        title: a.module.title,
        programme: {
          id: a.module.programme.id,
          code: a.module.programme.code,
          name: a.module.programme.name,
        },
      },
      submission: submissionData,
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
        id: student.academicYear.id,
        name: student.academicYear.name,
      },
    },
    assessments,
  };
}

/**
 * Handle student submission or resubmission with atomic version increment
 */
export async function saveStudentSubmission(
  input: CreateSubmissionInput,
  storageKey: string
) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: input.assessmentId },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });

  if (!student) {
    throw new Error("Student record not found");
  }

  // Atomic transaction to ensure version increment & single submission record per student per assessment
  return await prisma.$transaction(async (tx) => {
    // 1. Check if Submission already exists for (studentId, assessmentId)
    let submission = await tx.submission.findUnique({
      where: {
        studentId_assessmentId: {
          studentId: input.studentId,
          assessmentId: input.assessmentId,
        },
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    let nextVersionNumber = 1;

    if (!submission) {
      submission = await tx.submission.create({
        data: {
          studentId: input.studentId,
          assessmentId: input.assessmentId,
        },
        include: {
          versions: true,
        },
      });
    } else {
      const currentLatest = submission.versions[0]?.versionNumber || 0;
      nextVersionNumber = currentLatest + 1;
    }

    const version = await tx.submissionVersion.create({
      data: {
        submissionId: submission.id,
        versionNumber: nextVersionNumber,
        fileName: input.fileName,
        storageKey,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        submittedAt: new Date(),
      },
    });

    const isLate = new Date(version.submittedAt) > new Date(assessment.deadline);

    return {
      submissionId: submission.id,
      versionId: version.id,
      versionNumber: version.versionNumber,
      fileName: version.fileName,
      fileSize: version.fileSize,
      submittedAt: version.submittedAt,
      isLate,
      lateDurationText: isLate
        ? getLateDurationText(new Date(version.submittedAt), new Date(assessment.deadline))
        : null,
    };
  });
}
