import { NextRequest, NextResponse } from "next/server";
import { listFees } from "@/server/services/fee.service";
import { parsePagination } from "@/server/types/pagination";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const statusParam = searchParams.get("status") || undefined;

    const status =
      statusParam && ["PAID", "PARTIAL", "OVERDUE", "ALL"].includes(statusParam)
        ? (statusParam as "PAID" | "PARTIAL" | "OVERDUE" | "ALL")
        : undefined;

    const pagination = parsePagination(searchParams);
    const result = await listFees({ search, status, ...pagination });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch fee ledger" },
      { status: 500 }
    );
  }
}
