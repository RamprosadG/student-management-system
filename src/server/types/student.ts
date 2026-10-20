import { EnrolmentStatus } from "@/generated/prisma/client";

export interface StudentFilterParams {
  search?: string;
  programmeId?: string;
  status?: EnrolmentStatus;
}
