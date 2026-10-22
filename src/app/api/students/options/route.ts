import { NextResponse } from "next/server";
import { listStudentOptions } from "@/server/services/student.service";

export async function GET() {
  try {
    const options = await listStudentOptions();
    return NextResponse.json({ success: true, data: options });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch students",
      },
      { status: 500 }
    );
  }
}
