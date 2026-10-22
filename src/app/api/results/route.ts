import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  recordAssessmentGrade,
  toggleResultPublication,
} from "@/server/services/result.service";
import {
  SaveGradeSchema,
  TogglePublishSchema,
} from "@/lib/validations/result";

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
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to record grade",
      },
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
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error
          ? error.message
          : "Failed to toggle result publication",
      },
      { status: 400 }
    );
  }
}
