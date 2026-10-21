import { NextRequest, NextResponse } from "next/server";
import { getStudentAssessmentSummary } from "@/server/services/student-assessment.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const summary = await getStudentAssessmentSummary(
      searchParams.get("studentId")
    );

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load student assessment summary",
      },
      { status: 500 }
    );
  }
}
