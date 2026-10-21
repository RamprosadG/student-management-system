import { NextRequest, NextResponse } from "next/server";
import { getStudentAssessments } from "@/server/services/assessment.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const data = await getStudentAssessments({
      studentId: searchParams.get("studentId"),
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load student assessments",
      },
      { status: 500 }
    );
  }
}
