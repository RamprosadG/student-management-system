import { z } from "zod";

export const CreateAssessmentSchema = z.object({
  moduleId: z.string().uuid("Please select a valid module"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  deadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid deadline date and time",
    }),
});

export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;
