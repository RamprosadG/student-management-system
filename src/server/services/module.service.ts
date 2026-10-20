import { findModules } from "@/server/repositories/module.repository";
import { ModuleFilterParams } from "@/server/types/module";

export async function listModules(filters: ModuleFilterParams = {}) {
  return findModules(filters);
}
