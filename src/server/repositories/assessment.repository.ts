import prisma from "@/lib/prisma";
import { CreateAssessmentInput } from "@/lib/validations/assessment";

export interface AssessmentFilterParams {
  search?: string;
  moduleId?: string;
  programmeId?: string;
}

export async function findAssessmentsWithStats(filters: AssessmentFilterParams) {
  const where: any = {};

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
    where.module = {
      ...(where.module || {}),
      programmeId: filters.programmeId,
    };
  }

  const assessments = await prisma.assessment.findMany({
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
  });

  const now = new Date();

  // Enhance with computed metrics: submission counts, late counts, and formatted late info
  return assessments.map((assessment) => {
    const deadlineDate = new Date(assessment.deadline);
    const isPastDeadline = deadlineDate < now;

    const formattedSubmissions = assessment.submissions.map((sub) => {
      const latestVersion = sub.versions[0] || null;
      const submittedAt = latestVersion ? new Date(latestVersion.submittedAt) : new Date(sub.createdAt);
      const isLate = submittedAt > deadlineDate;

      let lateDurationText: string | null = null;
      if (isLate) {
        const diffMs = submittedAt.getTime() - deadlineDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        const days = Math.floor(hours / 24);

        if (days > 0) {
          lateDurationText = `Late by ${days}d ${hours % 24}h`;
        } else if (hours > 0) {
          lateDurationText = `Late by ${hours}h ${mins}m`;
        } else {
          lateDurationText = `Late by ${Math.max(1, mins)}m`;
        }
      }

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
        lateDurationText,
        result: sub.result
          ? {
              id: sub.result.id,
              grade: Number(sub.result.grade),
              isPublished: sub.result.isPublished,
            }
          : null,
      };
    });

    const totalSubmissions = formattedSubmissions.length;
    const lateSubmissionsCount = formattedSubmissions.filter((s) => s.isLate).length;
    const onTimeSubmissionsCount = totalSubmissions - lateSubmissionsCount;

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
        onTimeSubmissionsCount,
        lateSubmissionsCount,
      },
      submissions: formattedSubmissions,
    };
  });
}

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

export async function getAssessmentModules() {
  return prisma.module.findMany({
    include: {
      programme: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: [
      { programme: { code: "asc" } },
      { code: "asc" },
    ],
  });
}
