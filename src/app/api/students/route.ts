import { NextRequest, NextResponse } from "next/server";
import {
  enrolStudent,
  updateStudent,
} from "@/server/services/student.service";
import {
  CreateStudentSchema,
  UpdateStudentSchema,
} from "@/lib/validations/student";

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
      {
        success: false,
        message: error.message || "Failed to update student",
      },
      { status: 400 }
    );
  }
}
