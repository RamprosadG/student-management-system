import { z } from "zod";

export const RecordPaymentSchema = z.object({
  studentFeeId: z.string().uuid("Please select a valid fee account"),
  amount: z
    .number()
    .positive("Payment amount must be greater than 0")
    .max(1000000, "Payment amount cannot exceed 1,000,000"),
  referenceNumber: z
    .string()
    .min(3, "Reference number must be at least 3 characters")
    .max(100, "Reference number cannot exceed 100 characters"),
  paidAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid payment date is required",
    })
    .optional(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
