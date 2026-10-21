import { NextResponse } from "next/server";
import { getStaffStudentSummary } from "@/server/services/student.service";

export async function GET() {
  try {
    const summary = await getStaffStudentSummary();

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load student registry summary",
      },
      { status: 500 }
    );
  }
}
