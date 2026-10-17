import { z } from "zod";

export const EnrolmentStatusEnum = z.enum([
  "ENROLLED",
  "DEFERRED",
  "WITHDRAWN",
  "COMPLETED",
]);

export const CreateStudentSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Full name cannot exceed 150 characters"),
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(254, "Email cannot exceed 254 characters"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid date of birth is required",
  }),
  programmeId: z.string().uuid("Please select a valid programme"),
  academicYearId: z.string().uuid("Please select a valid academic year"),
  status: EnrolmentStatusEnum.default("ENROLLED"),
});

export const UpdateStudentSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Full name cannot exceed 150 characters")
    .optional(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(254, "Email cannot exceed 254 characters")
    .optional(),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid date of birth is required",
    })
    .optional(),
  status: EnrolmentStatusEnum.optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;

