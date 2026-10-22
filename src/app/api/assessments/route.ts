import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createAssessment } from "@/server/services/assessment.service";
import { CreateAssessmentSchema } from "@/lib/validations/assessment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateAssessmentSchema.parse(body);

    const assessment = await createAssessment(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Assessment created successfully",
        data: assessment,
      },
      { status: 201 }
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
        message: error instanceof Error ? error.message : "Failed to create assessment",
      },
      { status: 500 }
    );
  }
}
