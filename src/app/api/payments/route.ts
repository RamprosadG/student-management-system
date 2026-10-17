import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/server/services/fee.service";
import { RecordPaymentSchema } from "@/lib/validations/fee";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RecordPaymentSchema.parse(body);

    const payment = await createPayment(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Payment transaction recorded successfully",
        data: payment,
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
      { success: false, message: error.message || "Failed to record payment" },
      { status: 400 }
    );
  }
}
