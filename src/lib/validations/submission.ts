import { z } from "zod";

export const CreateSubmissionSchema = z.object({
  studentId: z.string().uuid("Please provide a valid student identifier"),
  assessmentId: z.string().uuid("Please provide a valid assessment identifier"),
  fileName: z
    .string()
    .min(1, "File name is required")
    .refine(
      (name) => {
        const ext = name.toLowerCase().split(".").pop();
        return ext === "pdf" || ext === "docx";
      },
      {
        message: "Only PDF (.pdf) and Word (.docx) files are accepted",
      }
    ),
  mimeType: z.string().min(1, "MIME type is required"),
  fileSize: z
    .number()
    .positive("File size must be greater than 0")
    .max(10 * 1024 * 1024, "File size must not exceed 10MB"),
});

export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;
