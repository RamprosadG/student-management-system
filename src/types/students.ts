export type EnrolmentStatus = "ENROLLED" | "DEFERRED" | "WITHDRAWN" | "COMPLETED";

export interface StudentRecord {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  status: EnrolmentStatus;
  createdAt: string;
  programme: {
    id: string;
    code: string;
    name: string;
    standardFee: number;
  };
  academicYear: {
    id: string;
    name: string;
  };
  studentFee?: {
    id: string;
    amountDue: number;
    dueDate: string;
  } | null;
}

export interface ReferenceMeta {
  programmes: Array<{ id: string; name: string; code: string }>;
  academicYears: Array<{ id: string; name: string }>;
}
