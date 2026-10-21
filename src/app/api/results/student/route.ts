import { NextRequest, NextResponse } from "next/server";
import { getStudentMarksheet } from "@/server/services/student-marksheet.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const data = await getStudentMarksheet(searchParams.get("studentId"));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load student marksheet",
      },
      { status: 500 }
    );
  }
}
