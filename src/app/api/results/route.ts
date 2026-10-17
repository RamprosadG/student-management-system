import { NextRequest, NextResponse } from "next/server";
import {
  getStaffGradingSheet,
  getStudentOfficialMarksheet,
  recordAssessmentGrade,
  toggleResultPublication,
} from "@/server/services/result.service";
import {
  SaveGradeSchema,
  TogglePublishSchema,
} from "@/lib/validations/result";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "student" or "staff" (default)

    if (view === "student") {
      let studentId = searchParams.get("studentId");

      // Fallback: If no studentId passed, find first student
      if (!studentId) {
        const firstStudent = await prisma.student.findFirst({
          where: { status: "ENROLLED" },
          orderBy: { createdAt: "asc" },
        });
        if (firstStudent) studentId = firstStudent.id;
      }

      if (!studentId) {
        return NextResponse.json({
          success: true,
          data: {
            student: null,
            marksheet: [],
            stats: {
              totalAssessments: 0,
              publishedResultsCount: 0,
              withheldOrPendingCount: 0,
              averageGrade: null,
              overallClassification: null,
            },
          },
        });
      }

      const marksheetData = await getStudentOfficialMarksheet(studentId);
      return NextResponse.json({ success: true, data: marksheetData });
    }

    // Default: Staff Grading View
    const search = searchParams.get("search") || undefined;
    const moduleId = searchParams.get("moduleId") || undefined;
    const publishStatus = (searchParams.get("publishStatus") || "ALL") as any;

    const gradingList = await getStaffGradingSheet({
      search,
      moduleId,
      publishStatus,
    });

    return NextResponse.json({
      success: true,
      data: gradingList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch results" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SaveGradeSchema.parse(body);

    const result = await recordAssessmentGrade(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: `Grade ${result.grade}% recorded successfully (${result.classification})`,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      const firstError = error.errors?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to record grade" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = TogglePublishSchema.parse(body);

    const updated = await toggleResultPublication(validatedData);

    return NextResponse.json({
      success: true,
      message: updated.isPublished
        ? "Result published to student marksheet"
        : "Result withheld from student view",
      data: updated,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const firstError = error.errors?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to toggle result publication" },
      { status: 400 }
    );
  }
}
