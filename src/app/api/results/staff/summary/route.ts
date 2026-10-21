import { NextResponse } from "next/server";
import { getStaffResultSummary } from "@/server/services/result.service";

export async function GET() {
  try {
    const summary = await getStaffResultSummary();

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load staff results summary",
      },
      { status: 500 }
    );
  }
}
