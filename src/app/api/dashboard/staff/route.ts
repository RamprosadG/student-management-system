import { NextResponse } from "next/server";
import { getStaffDashboardMetrics } from "@/server/services/staff-dashboard.service";

export async function GET() {
  try {
    const metrics = await getStaffDashboardMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load staff dashboard metrics",
      },
      { status: 500 }
    );
  }
}
