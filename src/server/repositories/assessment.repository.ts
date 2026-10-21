import prisma from "@/lib/prisma";
import { CreateAssessmentInput } from "@/lib/validations/assessment";

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
