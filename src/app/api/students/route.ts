import { NextRequest, NextResponse } from "next/server";
import {
  listStudents,
  enrolStudent,
  getEnrolmentReferenceData,
} from "@/server/services/student.service";
import { CreateStudentSchema } from "@/lib/validations/student";
import { EnrolmentStatus } from "@/generated/prisma/client";
import { parsePagination } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const programmeId = searchParams.get("programmeId") || undefined;
    const statusParam = searchParams.get("status") || undefined;

    // Check if reference metadata requested
    if (searchParams.get("meta") === "true") {
      const meta = await getEnrolmentReferenceData();
      return NextResponse.json({ success: true, data: meta });
    }

    const status = statusParam ? (statusParam as EnrolmentStatus) : undefined;
    const pagination = parsePagination(searchParams);
    const result = await listStudents({ search, programmeId, status, ...pagination });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateStudentSchema.parse(body);

    const newStudent = await enrolStudent(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Student enrolled successfully",
        data: newStudent,
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
      { success: false, message: error.message || "Failed to enrol student" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updatePayload } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid student ID is required" },
        { status: 400 }
      );
    }

    const { UpdateStudentSchema } = await import("@/lib/validations/student");
    const { updateStudent } = await import("@/server/services/student.service");

    const validatedData = UpdateStudentSchema.parse(updatePayload);
    const updated = await updateStudent(id, validatedData);

    return NextResponse.json({
      success: true,
      message: "Student record updated successfully",
      data: updated,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const firstError = error.errors?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to update student" },
      { status: 400 }
    );
  }
}

