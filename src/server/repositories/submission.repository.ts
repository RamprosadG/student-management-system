import prisma from "@/lib/prisma";
import { CreateSubmissionInput } from "@/lib/validations/submission";

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
