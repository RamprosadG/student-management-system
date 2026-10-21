import { NextRequest, NextResponse } from "next/server";
import { getStaffFees } from "@/server/services/fee.service";
import { parsePagination } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);

    const data = await getStaffFees({
      search: searchParams.get("search") || undefined,
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
          error instanceof Error ? error.message : "Failed to load fee ledger",
      },
      { status: 500 }
    );
  }
}
