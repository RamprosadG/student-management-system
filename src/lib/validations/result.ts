import { z } from "zod";

export const SaveGradeSchema = z.object({
  submissionId: z.string().uuid("Please provide a valid submission ID"),
  grade: z
    .number({ message: "Grade must be a numeric score" })
    .min(0, "Grade cannot be less than 0")
    .max(100, "Grade cannot exceed 100"),
  isPublished: z.boolean().default(false),
});

export const TogglePublishSchema = z.object({
  submissionId: z.string().uuid("Please provide a valid submission ID"),
  isPublished: z.boolean(),
});

export type SaveGradeInput = z.infer<typeof SaveGradeSchema>;
export type TogglePublishInput = z.infer<typeof TogglePublishSchema>;

export type Classification = "Distinction" | "Merit" | "Pass" | "Fail";

export function getGradeClassification(grade: number): Classification {
  if (grade >= 70) return "Distinction";
  if (grade >= 60) return "Merit";
  if (grade >= 40) return "Pass";
  return "Fail";
}
