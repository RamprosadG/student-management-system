import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getGradeClassification } from "@/lib/validations/result";
import {
  StudentMarksheetItem,
  StudentMarksheetListResult,
  StudentMarksheetStats,
} from "@/server/types/student-marksheet";

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
