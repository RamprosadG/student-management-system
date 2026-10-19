import {
  findModules,
  ModuleFilterParams,
} from "@/server/repositories/module.repository";

export async function listModules(filters: ModuleFilterParams = {}) {
  return findModules(filters);
}
