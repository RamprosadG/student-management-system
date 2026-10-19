import { NextRequest, NextResponse } from "next/server";
import { listModules } from "@/server/services/module.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programmeId = searchParams.get("programmeId") || undefined;

    const modules = await listModules({ programmeId });

    return NextResponse.json({
      success: true,
      data: modules,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch modules";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
