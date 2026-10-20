import prisma from "@/lib/prisma";
import { ModuleFilterParams } from "@/server/types/module";

export async function findModules(filters: ModuleFilterParams = {}) {
  return prisma.module.findMany({
    where: filters.programmeId ? { programmeId: filters.programmeId } : undefined,
    select: {
      id: true,
      code: true,
      title: true,
      programmeId: true,
      programme: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: [{ programme: { code: "asc" } }, { code: "asc" }],
  });
}
