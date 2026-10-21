import prisma from "@/lib/prisma";
import {
  SaveGradeInput,
  TogglePublishInput,
  getGradeClassification,
} from "@/lib/validations/result";

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
