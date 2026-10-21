import { NextRequest, NextResponse } from "next/server";
import { getStaffResults } from "@/server/services/staff-result.service";
import { parsePagination } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);

    const data = await getStaffResults({
      search: searchParams.get("search") || undefined,
      moduleId: searchParams.get("moduleId") || undefined,
      publishStatus: searchParams.get("publishStatus") || undefined,
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
            : "Failed to load staff results",
      },
      { status: 500 }
    );
  }
}
