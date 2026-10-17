import { NextRequest, NextResponse } from "next/server";
import {
  getStaffDashboardMetrics,
  getStudentDashboardMetrics,
} from "@/server/services/dashboard.service";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "student" or "staff" (default)

    if (view === "student") {
      let studentId = searchParams.get("studentId");

      // Fallback: If no studentId provided, use first enrolled student
      if (!studentId) {
        const first = await prisma.student.findFirst({
          where: { status: "ENROLLED" },
          orderBy: { createdAt: "asc" },
        });
        if (first) studentId = first.id;
      }

      if (!studentId) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }

      const studentMetrics = await getStudentDashboardMetrics(studentId);
      return NextResponse.json({
        success: true,
        data: studentMetrics,
      });
    }

    // Default: Staff Dashboard
    const metrics = await getStaffDashboardMetrics();
    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
