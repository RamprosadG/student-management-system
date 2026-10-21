import { NextResponse } from "next/server";
import { getStaffFeeSummary } from "@/server/services/fee.service";

export async function GET() {
  try {
    const summary = await getStaffFeeSummary();

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load fee ledger summary",
      },
      { status: 500 }
    );
  }
}
