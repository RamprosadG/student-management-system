import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { submitAssessmentWork } from "@/server/services/submission.service";
import { CreateSubmissionSchema } from "@/lib/validations/submission";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, message: firstError },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to submit assessment",
      },
      { status: 400 }
    );
  }
}
