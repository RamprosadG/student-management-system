import { NextRequest, NextResponse } from "next/server";
import { getStudentMarksheetStats } from "@/server/services/student-marksheet.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const stats = await getStudentMarksheetStats(searchParams.get("studentId"));

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load student marksheet stats",
      },
      { status: 500 }
    );
  }
}
