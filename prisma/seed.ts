import "dotenv/config";
import { PrismaClient, EnrolmentStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding comprehensive demo dataset for technical assessment...");

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

  // 3. Curriculum Modules
  const cs101 = await prisma.module.upsert({
    where: {
      programmeId_code: {
        programmeId: bscCs.id,
        code: "CS101",
      },
    },
    update: {},
    create: {
      programmeId: bscCs.id,
      code: "CS101",
      title: "Introduction to Software Engineering",
    },
  });

  const cs102 = await prisma.module.upsert({
    where: {
      programmeId_code: {
        programmeId: bscCs.id,
        code: "CS102",
      },
    },
    update: {},
    create: {
      programmeId: bscCs.id,
      code: "CS102",
      title: "Database Systems & Architecture",
    },
  });

  const cs103 = await prisma.module.upsert({
    where: {
      programmeId_code: {
        programmeId: bscCs.id,
        code: "CS103",
      },
    },
    update: {},
    create: {
      programmeId: bscCs.id,
      code: "CS103",
      title: "Web Technologies & Cloud Services",
    },
  });

  const bus101 = await prisma.module.upsert({
    where: {
      programmeId_code: {
        programmeId: baBusiness.id,
        code: "BUS101",
      },
    },
    update: {},
    create: {
      programmeId: baBusiness.id,
      code: "BUS101",
      title: "Principles of Management",
    },
  });

  const bus102 = await prisma.module.upsert({
    where: {
      programmeId_code: {
        programmeId: baBusiness.id,
        code: "BUS102",
      },
    },
    update: {},
    create: {
      programmeId: baBusiness.id,
      code: "BUS102",
      title: "Financial Accounting & Reporting",
    },
  });

  // 4. Students (Diverse Enrolment Statuses & Profiles: 6 Students)
  const studentsData = [
    {
      studentId: "SMS-2025-0001",
      fullName: "Alex Rivera",
      email: "alex.rivera@university.ac.uk",
      dob: new Date("2002-04-14"),
      programmeId: bscCs.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 9000.0,
      feeDueDate: new Date("2025-10-15"), // Past due
    },
    {
      studentId: "SMS-2025-0002",
      fullName: "Sophia Chen",
      email: "sophia.chen@university.ac.uk",
      dob: new Date("2003-09-21"),
      programmeId: bscCs.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 9000.0,
      feeDueDate: new Date("2026-03-31"), // Future due
    },
    {
      studentId: "SMS-2025-0003",
      fullName: "Marcus Adebayo",
      email: "marcus.adebayo@university.ac.uk",
      dob: new Date("2001-11-05"),
      programmeId: baBusiness.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 7500.0,
      feeDueDate: new Date("2025-09-30"), // Past due (Overdue test)
    },
    {
      studentId: "SMS-2025-0004",
      fullName: "Elena Rostova",
      email: "elena.rostova@university.ac.uk",
      dob: new Date("2002-02-18"),
      programmeId: baBusiness.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.DEFERRED,
      feeAmount: 7500.0,
      feeDueDate: new Date("2026-01-15"),
    },
    {
      studentId: "SMS-2025-0005",
      fullName: "Jordan Taylor",
      email: "jordan.taylor@university.ac.uk",
      dob: new Date("2000-07-30"),
      programmeId: bscCs.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.WITHDRAWN,
      feeAmount: 9000.0,
      feeDueDate: new Date("2025-11-30"),
    },
    {
      studentId: "SMS-2025-0006",
      fullName: "Priya Patel",
      email: "priya.patel@university.ac.uk",
      dob: new Date("2001-05-12"),
      programmeId: bscCs.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.COMPLETED,
      feeAmount: 9000.0,
      feeDueDate: new Date("2025-06-30"),
    },
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const student = await prisma.student.upsert({
      where: { email: s.email },
      update: {
        status: s.status,
      },
      create: {
        studentId: s.studentId,
        fullName: s.fullName,
        email: s.email,
        dateOfBirth: s.dob,
        programmeId: s.programmeId,
        academicYearId: s.academicYearId,
        status: s.status,
      },
    });

    // Create or update Fee
    const fee = await prisma.studentFee.upsert({
      where: { studentId: student.id },
      update: {
        amountDue: s.feeAmount,
        dueDate: s.feeDueDate,
      },
      create: {
        studentId: student.id,
        amountDue: s.feeAmount,
        dueDate: s.feeDueDate,
      },
    });

    createdStudents.push({ ...student, feeId: fee.id, feeDueDate: s.feeDueDate });
  }

  // 5. Fee Payments (Demonstrating Paid, Partial, and Overdue Accounts)
  // Alex Rivera (SMS-2025-0001): Partially paid ($5,000 paid out of $9,000, due 2025-10-15 => OVERDUE)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-RIV-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[0].feeId,
      amount: 5000.0,
      referenceNumber: "TXN-RIV-001",
      paidAt: new Date("2025-09-10"),
    },
  });

  // Sophia Chen (SMS-2025-0002): Fully paid ($9,000 paid in 2 installments => PAID)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-CHEN-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[1].feeId,
      amount: 4500.0,
      referenceNumber: "TXN-CHEN-001",
      paidAt: new Date("2025-09-02"),
    },
  });
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-CHEN-002" },
    update: {},
    create: {
      studentFeeId: createdStudents[1].feeId,
      amount: 4500.0,
      referenceNumber: "TXN-CHEN-002",
      paidAt: new Date("2025-12-15"),
    },
  });

  // Marcus Adebayo (SMS-2025-0003): Partial paid ($2,000 paid out of $7,500, due 2025-09-30 => OVERDUE $5,500)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-ADE-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[2].feeId,
      amount: 2000.0,
      referenceNumber: "TXN-ADE-001",
      paidAt: new Date("2025-09-15"),
    },
  });

  // Priya Patel (SMS-2025-0006): Completed student fully settled
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-PATEL-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[5].feeId,
      amount: 9000.0,
      referenceNumber: "TXN-PATEL-001",
      paidAt: new Date("2025-05-10"),
    },
  });

  // 6. Assessments
  // CS101 Assessment: Full Stack Architecture Specification (Past deadline to test late submission)
  const asm1 = await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      moduleId: cs101.id,
      title: "Coursework 1: Full-Stack Architecture Specification",
      deadline: new Date("2025-11-20T23:59:00Z"),
    },
  });

  // CS102 Assessment: Relational Schema & Normalization Portfolio
  const asm2 = await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      moduleId: cs102.id,
      title: "Portfolio: PostgreSQL Schema Optimization",
      deadline: new Date("2025-12-10T17:00:00Z"),
    },
  });

  // CS103 Assessment: Upcoming Deadline
  const asm3 = await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      moduleId: cs103.id,
      title: "Lab Report: Cloud Services & Microservices Deployment",
      deadline: new Date("2026-05-15T23:59:00Z"),
    },
  });

  // BUS101 Assessment: Management Strategy
  const asm4 = await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      moduleId: bus101.id,
      title: "Case Study: Strategic Analysis of Corporate Governance",
      deadline: new Date("2025-11-30T17:00:00Z"),
    },
  });

  // 7. Submissions, Versions, and Graded Results
  // Case A: Sophia Chen submitted On-Time (Grade 85 -> Distinction, Published)
  const subSophia = await prisma.submission.upsert({
    where: {
      studentId_assessmentId: {
        studentId: createdStudents[1].id,
        assessmentId: asm1.id,
      },
    },
    update: {},
    create: {
      studentId: createdStudents[1].id,
      assessmentId: asm1.id,
    },
  });

  await prisma.submissionVersion.upsert({
    where: {
      submissionId_versionNumber: {
        submissionId: subSophia.id,
        versionNumber: 1,
      },
    },
    update: {},
    create: {
      submissionId: subSophia.id,
      versionNumber: 1,
      fileName: "Sophia_Chen_CS101_CW1.pdf",
      storageKey: "/uploads/submissions/seed_sophia_cs101.pdf",
      mimeType: "application/pdf",
      fileSize: 1024 * 350,
      submittedAt: new Date("2025-11-18T14:30:00Z"), // On time
    },
  });

  await prisma.assessmentResult.upsert({
    where: { submissionId: subSophia.id },
    update: {
      grade: 85.0,
      isPublished: true,
    },
    create: {
      submissionId: subSophia.id,
      grade: 85.0,
      isPublished: true,
      gradedAt: new Date("2025-11-25"),
    },
  });

  // Case B: Alex Rivera submitted LATE with 2 versions (Grade 68 -> Merit, WITHHELD from student view)
  const subAlex = await prisma.submission.upsert({
    where: {
      studentId_assessmentId: {
        studentId: createdStudents[0].id,
        assessmentId: asm1.id,
      },
    },
    update: {},
    create: {
      studentId: createdStudents[0].id,
      assessmentId: asm1.id,
    },
  });

  // Version 1: Submitted before deadline
  await prisma.submissionVersion.upsert({
    where: {
      submissionId_versionNumber: {
        submissionId: subAlex.id,
        versionNumber: 1,
      },
    },
    update: {},
    create: {
      submissionId: subAlex.id,
      versionNumber: 1,
      fileName: "Alex_Rivera_Draft_CS101.docx",
      storageKey: "/uploads/submissions/seed_alex_cs101_v1.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 1024 * 120,
      submittedAt: new Date("2025-11-20T21:00:00Z"),
    },
  });

  // Version 2: Resubmitted 3 hours past deadline
  await prisma.submissionVersion.upsert({
    where: {
      submissionId_versionNumber: {
        submissionId: subAlex.id,
        versionNumber: 2,
      },
    },
    update: {},
    create: {
      submissionId: subAlex.id,
      versionNumber: 2,
      fileName: "Alex_Rivera_Final_CS101.pdf",
      storageKey: "/uploads/submissions/seed_alex_cs101_v2.pdf",
      mimeType: "application/pdf",
      fileSize: 1024 * 450,
      submittedAt: new Date("2025-11-21T03:15:00Z"), // Late by 3h 16m
    },
  });

  // Staff graded with 68% (Merit), but WITHHELD for registry moderation
  await prisma.assessmentResult.upsert({
    where: { submissionId: subAlex.id },
    update: {
      grade: 68.0,
      isPublished: false, // Withheld test case
    },
    create: {
      submissionId: subAlex.id,
      grade: 68.0,
      isPublished: false, // Withheld test case
      gradedAt: new Date("2025-11-26"),
    },
  });

  // Case C: Sophia Chen CS102 - Graded 92% Distinction (Published)
  const subSophia2 = await prisma.submission.upsert({
    where: {
      studentId_assessmentId: {
        studentId: createdStudents[1].id,
        assessmentId: asm2.id,
      },
    },
    update: {},
    create: {
      studentId: createdStudents[1].id,
      assessmentId: asm2.id,
    },
  });

  await prisma.submissionVersion.upsert({
    where: {
      submissionId_versionNumber: {
        submissionId: subSophia2.id,
        versionNumber: 1,
      },
    },
    update: {},
    create: {
      submissionId: subSophia2.id,
      versionNumber: 1,
      fileName: "Sophia_Chen_CS102_PostgreSQL.pdf",
      storageKey: "/uploads/submissions/seed_sophia_cs102.pdf",
      mimeType: "application/pdf",
      fileSize: 1024 * 600,
      submittedAt: new Date("2025-12-09T16:00:00Z"),
    },
  });

  await prisma.assessmentResult.upsert({
    where: { submissionId: subSophia2.id },
    update: {
      grade: 92.0,
      isPublished: true,
    },
    create: {
      submissionId: subSophia2.id,
      grade: 92.0,
      isPublished: true,
      gradedAt: new Date("2025-12-14"),
    },
  });

  // Case D: Marcus Adebayo BUS101 - Submitted, Awaiting Grading (Ungraded)
  const subMarcus = await prisma.submission.upsert({
    where: {
      studentId_assessmentId: {
        studentId: createdStudents[2].id,
        assessmentId: asm4.id,
      },
    },
    update: {},
    create: {
      studentId: createdStudents[2].id,
      assessmentId: asm4.id,
    },
  });

  await prisma.submissionVersion.upsert({
    where: {
      submissionId_versionNumber: {
        submissionId: subMarcus.id,
        versionNumber: 1,
      },
    },
    update: {},
    create: {
      submissionId: subMarcus.id,
      versionNumber: 1,
      fileName: "Marcus_Adebayo_BUS101_CaseStudy.docx",
      storageKey: "/uploads/submissions/seed_marcus_bus101.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 1024 * 210,
      submittedAt: new Date("2025-11-29T10:00:00Z"),
    },
  });

  console.log("-----------------------------------------------------------------");
  console.log("Demo dataset seeded successfully!");
  console.log(`Programmes created: 3 (BSc Computer Science, BA Business Admin, BSc Data Science)`);
  console.log(`Students enrolled: ${createdStudents.length} across diverse statuses (Enrolled, Deferred, Withdrawn, Completed)`);
  console.log(`Financial scenarios: Paid (Sophia), Overdue (Alex & Marcus), Completed (Priya)`);
  console.log(`Submissions & Grades: On-time (Sophia), Late resubmission (Alex), Published & Withheld marks, and Ungraded (Marcus)`);
  console.log("-----------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
