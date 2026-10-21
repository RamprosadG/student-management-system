import { NextRequest, NextResponse } from "next/server";
import { getStaffAssessments } from "@/server/services/staff-assessment.service";
import { parsePagination } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);

    const data = await getStaffAssessments({
      search: searchParams.get("search") || undefined,
      moduleId: searchParams.get("moduleId") || undefined,
      programmeId: searchParams.get("programmeId") || undefined,
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load staff assessments",
      },
      { status: 500 }
    );
  }
}
