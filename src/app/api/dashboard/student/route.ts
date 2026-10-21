import { NextRequest, NextResponse } from "next/server";
import {
  getStudentDashboardMetrics,
  resolveStudentDashboardId,
} from "@/server/services/student-dashboard.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = await resolveStudentDashboardId(searchParams.get("studentId"));

    if (!studentId) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const metrics = await getStudentDashboardMetrics(studentId);

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
            : "Failed to load student dashboard metrics",
      },
      { status: 500 }
    );
  }
}
