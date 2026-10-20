import prisma from "@/lib/prisma";
import {
  SaveGradeInput,
  TogglePublishInput,
  getGradeClassification,
  Classification,
} from "@/lib/validations/result";

export interface StaffGradingItem {
  submissionId: string;
  studentId: string;
  studentUuid: string;
  studentName: string;
  studentEmail: string;
  assessmentId: string;
  assessmentTitle: string;
  deadline: string;
  moduleCode: string;
  moduleTitle: string;
  programmeCode: string;
  programmeName: string;
  fileName: string;
  fileSize: number;
  fileUrl: string | null;
  submittedAt: string;
  versionCount: number;
  latestVersionNumber: number;
  isLate: boolean;
  lateDurationText: string | null;
  resultId: string | null;
  grade: number | null;
  classification: Classification | null;
  isPublished: boolean;
  gradedAt: string | null;
}

export interface StudentMarksheetItem {
  id: string; // assessmentId
  assessmentTitle: string;
  moduleCode: string;
  moduleTitle: string;
  deadline: string;
  submission: {
    id: string;
    fileName: string;
    submittedAt: string;
    isLate: boolean;
    versionNumber: number;
  } | null;
  result: {
    id: string;
    grade: number;
    classification: Classification;
    gradedAt: string;
  } | null; // null if not graded OR withheld
  hasSubmission: boolean;
  statusText: string;
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

/**
 * Fetch all submissions for Staff Grading Sheet with search, module filter, and publish status filter
 */
export async function findStaffGradingList(params: {
  search?: string;
  moduleId?: string;
  publishStatus?: "ALL" | "PUBLISHED" | "WITHHELD" | "UNGRADED";
}): Promise<StaffGradingItem[]> {
  const where: any = {};

  if (params.search) {
    where.OR = [
      { student: { fullName: { contains: params.search, mode: "insensitive" } } },
      { student: { studentId: { contains: params.search, mode: "insensitive" } } },
      { assessment: { title: { contains: params.search, mode: "insensitive" } } },
      { assessment: { module: { title: { contains: params.search, mode: "insensitive" } } } },
      { assessment: { module: { code: { contains: params.search, mode: "insensitive" } } } },
    ];
  }

  if (params.moduleId) {
    where.assessment = {
      ...(where.assessment || {}),
      moduleId: params.moduleId,
    };
  }

  if (params.publishStatus === "PUBLISHED") {
    where.result = { isPublished: true };
  } else if (params.publishStatus === "WITHHELD") {
    where.result = { isPublished: false };
  } else if (params.publishStatus === "UNGRADED") {
    where.result = null;
  }

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
      },
      result: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return submissions.map((s) => {
    const latestVer = s.versions[0];
    const deadline = new Date(s.assessment.deadline);
    const submittedAt = latestVer ? new Date(latestVer.submittedAt) : new Date(s.createdAt);
    const isLate = submittedAt > deadline;

    const gradeNumber = s.result ? Number(s.result.grade) : null;
    const classification = gradeNumber !== null ? getGradeClassification(gradeNumber) : null;

    return {
      submissionId: s.id,
      studentId: s.student.studentId,
      studentUuid: s.student.id,
      studentName: s.student.fullName,
      studentEmail: s.student.email,
      assessmentId: s.assessment.id,
      assessmentTitle: s.assessment.title,
      deadline: s.assessment.deadline.toISOString(),
      moduleCode: s.assessment.module.code,
      moduleTitle: s.assessment.module.title,
      programmeCode: s.assessment.module.programme.code,
      programmeName: s.assessment.module.programme.name,
      fileName: latestVer?.fileName || "submission",
      fileSize: latestVer?.fileSize || 0,
      fileUrl: latestVer?.storageKey || null,
      submittedAt: submittedAt.toISOString(),
      versionCount: s.versions.length,
      latestVersionNumber: latestVer?.versionNumber || 1,
      isLate,
      lateDurationText: isLate ? getLateDurationText(submittedAt, deadline) : null,
      resultId: s.result?.id || null,
      grade: gradeNumber,
      classification,
      isPublished: s.result ? s.result.isPublished : false,
      gradedAt: s.result ? s.result.gradedAt.toISOString() : null,
    };
  });
}

/**
 * Fetch official marksheets for a student. CRITICAL: Strictly filters out unpublished/withheld results.
 */
export async function findStudentMarksheet(studentId: string): Promise<{
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
      name: string;
    };
  } | null;
  marksheet: StudentMarksheetItem[];
  stats: {
    totalAssessments: number;
    publishedResultsCount: number;
    withheldOrPendingCount: number;
    averageGrade: number | null;
    overallClassification: Classification | null;
  };
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
          name: true,
        },
      },
    },
  });

  if (!student) {
    return {
      student: null,
      marksheet: [],
      stats: {
        totalAssessments: 0,
        publishedResultsCount: 0,
        withheldOrPendingCount: 0,
        averageGrade: null,
        overallClassification: null,
      },
    };
  }

  // Get all assessments in student's programme
  const assessments = await prisma.assessment.findMany({
    where: {
      module: {
        programmeId: student.programmeId,
      },
    },
    include: {
      module: true,
      submissions: {
        where: { studentId: student.id },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
          result: true,
        },
      },
    },
    orderBy: {
      deadline: "asc",
    },
  });

  let publishedGradeSum = 0;
  let publishedGradeCount = 0;

  const marksheet: StudentMarksheetItem[] = assessments.map((a) => {
    const sub = a.submissions[0] || null;
    const latestVer = sub?.versions[0] || null;
    const result = sub?.result || null;

    let subData = null;
    if (sub && latestVer) {
      const deadlineDate = new Date(a.deadline);
      const submittedAtDate = new Date(latestVer.submittedAt);
      subData = {
        id: sub.id,
        fileName: latestVer.fileName,
        submittedAt: latestVer.submittedAt.toISOString(),
        isLate: submittedAtDate > deadlineDate,
        versionNumber: latestVer.versionNumber,
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
      publishedGradeSum += numericGrade;
      publishedGradeCount++;
    } else if (result && !result.isPublished) {
      // Result exists but is withheld by Registry
      statusText = "Result Withheld by Registry";
    } else if (sub) {
      // Submitted but not graded yet
      statusText = "Awaiting Evaluation";
    }

    return {
      id: a.id,
      assessmentTitle: a.title,
      moduleCode: a.module.code,
      moduleTitle: a.module.title,
      deadline: a.deadline.toISOString(),
      submission: subData,
      result: resultData,
      hasSubmission: Boolean(sub),
      statusText,
    };
  });

  const averageGrade =
    publishedGradeCount > 0 ? Number((publishedGradeSum / publishedGradeCount).toFixed(1)) : null;

  const overallClassification =
    averageGrade !== null ? getGradeClassification(averageGrade) : null;

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
    stats: {
      totalAssessments: assessments.length,
      publishedResultsCount: publishedGradeCount,
      withheldOrPendingCount: assessments.length - publishedGradeCount,
      averageGrade,
      overallClassification,
    },
  };
}

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
