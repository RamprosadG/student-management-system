import { connection } from "next/server";
import { findStaffDashboardData } from "@/server/repositories/staff-dashboard.repository";
import { StaffDashboardMetrics } from "@/server/types/staff-dashboard";

export async function getStaffDashboardMetrics(): Promise<StaffDashboardMetrics> {
  // Dashboard metrics are live aggregates, so they must never be prerendered.
  await connection();
  return await findStaffDashboardData();
}
