import { NextResponse } from "next/server";
import { getStaffAssessmentSummary } from "@/server/services/staff-assessment.service";

export async function GET() {
  try {
    const summary = await getStaffAssessmentSummary();

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load staff assessment summary",
      },
      { status: 500 }
    );
  }
}
