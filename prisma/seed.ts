import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding baseline reference data...");

  // 1. Programmes
  const bscCs = await prisma.programme.upsert({
    where: { code: "BSC-CS" },
    update: {},
    create: {
      code: "BSC-CS",
      name: "BSc (Hons) Computer Science",
      standardFee: 9000.0,
      isActive: true,
    },
  });

  const baBusiness = await prisma.programme.upsert({
    where: { code: "BA-BUS" },
    update: {},
    create: {
      code: "BA-BUS",
      name: "BA (Hons) Business Administration",
      standardFee: 7500.0,
      isActive: true,
    },
  });

  const bscDataScience = await prisma.programme.upsert({
    where: { code: "BSC-DS" },
    update: {},
    create: {
      code: "BSC-DS",
      name: "BSc (Hons) Data Science & AI",
      standardFee: 9500.0,
      isActive: true,
    },
  });

  // 2. Academic Years
  const ay2025 = await prisma.academicYear.upsert({
    where: { name: "2025/2026" },
    update: {},
    create: {
      name: "2025/2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-06-30"),
      isActive: true,
    },
  });

  const ay2026 = await prisma.academicYear.upsert({
    where: { name: "2026/2027" },
    update: {},
    create: {
      name: "2026/2027",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-06-30"),
      isActive: false,
    },
  });

  // 3. Baseline Modules for Programmes
  const csModules = [
    { code: "CS101", title: "Introduction to Software Engineering" },
    { code: "CS102", title: "Database Systems & Architecture" },
    { code: "CS103", title: "Web Technologies & Cloud Services" },
  ];

  for (const mod of csModules) {
    await prisma.module.upsert({
      where: {
        programmeId_code: {
          programmeId: bscCs.id,
          code: mod.code,
        },
      },
      update: {},
      create: {
        programmeId: bscCs.id,
        code: mod.code,
        title: mod.title,
      },
    });
  }

  const busModules = [
    { code: "BUS101", title: "Principles of Management" },
    { code: "BUS102", title: "Financial Accounting & Reporting" },
  ];

  for (const mod of busModules) {
    await prisma.module.upsert({
      where: {
        programmeId_code: {
          programmeId: baBusiness.id,
          code: mod.code,
        },
      },
      update: {},
      create: {
        programmeId: baBusiness.id,
        code: mod.code,
        title: mod.title,
      },
    });
  }

  console.log("Baseline reference data seeded successfully!");
  console.log(`Programmes created/ready: ${bscCs.code}, ${baBusiness.code}, ${bscDataScience.code}`);
  console.log(`Academic years created/ready: ${ay2025.name}, ${ay2026.name}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
