export interface FeeFilterParams {
  search?: string;
  status?: "ALL" | "PAID" | "PARTIAL" | "OVERDUE";
  page?: number;
  pageSize?: number;
}
