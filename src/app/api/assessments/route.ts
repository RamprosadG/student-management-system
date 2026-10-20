import { NextRequest, NextResponse } from "next/server";
import {
  listAssessments,
  createAssessment,
  listAssessmentReferenceModules,
} from "@/server/services/assessment.service";
import { CreateAssessmentSchema } from "@/lib/validations/assessment";
import { parsePagination } from "@/server/types/pagination";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const moduleId = searchParams.get("moduleId") || undefined;
    const programmeId = searchParams.get("programmeId") || undefined;

    // Check if module options requested
    if (searchParams.get("modules") === "true") {
      const modules = await listAssessmentReferenceModules();
      return NextResponse.json({ success: true, data: modules });
    }

    const pagination = parsePagination(searchParams);
    const data = await listAssessments({ search, moduleId, programmeId, ...pagination });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateAssessmentSchema.parse(body);

    const assessment = await createAssessment(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Assessment created successfully",
        data: assessment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      const firstError = error.errors?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create assessment" },
      { status: 500 }
    );
  }
}
