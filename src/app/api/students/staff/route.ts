import { NextRequest, NextResponse } from "next/server";
import { getStaffStudents } from "@/server/services/student.service";
import { parsePagination } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);

    const data = await getStaffStudents({
      search: searchParams.get("search") || undefined,
      programmeId: searchParams.get("programmeId") || undefined,
      status: searchParams.get("status") || undefined,
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
            : "Failed to load student registry",
      },
      { status: 500 }
    );
  }
}
