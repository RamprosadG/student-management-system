import { NextRequest, NextResponse } from "next/server";
import {
  getStudentAssessments,
  submitAssessmentWork,
} from "@/server/services/submission.service";
import { CreateSubmissionSchema } from "@/lib/validations/submission";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let studentId = searchParams.get("studentId");
    const search = searchParams.get("search") || undefined;

    // If studentId not passed, resolve first enrolled student by default
    if (!studentId) {
      const defaultStudent = await prisma.student.findFirst({
        where: { status: "ENROLLED" },
        orderBy: { createdAt: "asc" },
      });
      if (defaultStudent) {
        studentId = defaultStudent.id;
      }
    }

    if (!studentId) {
      return NextResponse.json({
        success: true,
        data: { student: null, assessments: [] },
      });
    }

    const data = await getStudentAssessments(studentId, search);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch student assessments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const studentId = formData.get("studentId") as string;
    const assessmentId = formData.get("assessmentId") as string;
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Please select a file to upload" },
        { status: 400 }
      );
    }

    // Validate inputs with Zod
    const validated = CreateSubmissionSchema.parse({
      studentId,
      assessmentId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
    });

    // Save uploaded file into public/uploads/submissions
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "submissions");
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${timestamp}_${safeBaseName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    const storageKey = `/uploads/submissions/${uniqueFileName}`;

    const submission = await submitAssessmentWork(validated, storageKey);

    return NextResponse.json(
      {
        success: true,
        message: submission.isLate
          ? `Work submitted successfully (Flagged: ${submission.lateDurationText})`
          : "Work submitted successfully on time",
        data: submission,
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
      { success: false, message: error.message || "Failed to submit assessment" },
      { status: 400 }
    );
  }
}
