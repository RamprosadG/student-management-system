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

  await prisma.academicYear.upsert({
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

  const ds101 = await prisma.module.upsert({
    where: {
      programmeId_code: {
        programmeId: bscDataScience.id,
        code: "DS101",
      },
    },
    update: {},
    create: {
      programmeId: bscDataScience.id,
      code: "DS101",
      title: "Statistical Learning Foundations",
    },
  });

  const ds102 = await prisma.module.upsert({
    where: {
      programmeId_code: {
        programmeId: bscDataScience.id,
        code: "DS102",
      },
    },
    update: {},
    create: {
      programmeId: bscDataScience.id,
      code: "DS102",
      title: "Big Data Pipeline Engineering",
    },
  });

  // 4. Students (12: 8 Enrolled, 2 Deferred, 1 Withdrawn, 1 Completed)
  // Fee scenarios are spread so PAID / OVERDUE / PARTIAL filters all have rows.
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
      feeDueDate: new Date("2026-01-15"), // Past due
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
      feeDueDate: new Date("2025-11-30"), // Past due, never paid
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
      feeDueDate: new Date("2025-06-30"), // Past due, fully settled
    },
    {
      studentId: "SMS-2025-0007",
      fullName: "Liam O'Connor",
      email: "liam.oconnor@university.ac.uk",
      dob: new Date("2002-12-03"),
      programmeId: bscCs.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 9000.0,
      feeDueDate: new Date("2025-12-01"), // Past due
    },
    {
      studentId: "SMS-2025-0008",
      fullName: "Aisha Khan",
      email: "aisha.khan@university.ac.uk",
      dob: new Date("2003-01-25"),
      programmeId: bscDataScience.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 9500.0,
      feeDueDate: new Date("2026-02-15"), // Future due
    },
    {
      studentId: "SMS-2025-0009",
      fullName: "Diego Fernandez",
      email: "diego.fernandez@university.ac.uk",
      dob: new Date("2002-06-08"),
      programmeId: baBusiness.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 7500.0,
      feeDueDate: new Date("2026-04-10"), // Future due, nothing paid yet
    },
    {
      studentId: "SMS-2025-0010",
      fullName: "Grace Kim",
      email: "grace.kim@university.ac.uk",
      dob: new Date("2001-10-17"),
      programmeId: bscCs.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 9000.0,
      feeDueDate: new Date("2026-05-20"), // Future due, settled early
    },
    {
      studentId: "SMS-2025-0011",
      fullName: "Noah Williams",
      email: "noah.williams@university.ac.uk",
      dob: new Date("2000-03-22"),
      programmeId: bscDataScience.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.ENROLLED,
      feeAmount: 9500.0,
      feeDueDate: new Date("2025-08-15"), // Long past due
    },
    {
      studentId: "SMS-2025-0012",
      fullName: "Fatima Hassan",
      email: "fatima.hassan@university.ac.uk",
      dob: new Date("2002-08-30"),
      programmeId: baBusiness.id,
      academicYearId: ay2025.id,
      status: EnrolmentStatus.DEFERRED,
      feeAmount: 7500.0,
      feeDueDate: new Date("2026-06-01"), // Future due
    },
  ];

  const createdStudents: Array<
    Awaited<ReturnType<typeof prisma.student.upsert>> & {
      feeId: string;
      feeDueDate: Date;
    }
  > = [];
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
  // Alex Rivera (SMS-2025-0001): Partially paid ($5,000 / $9,000, due 2025-10-15 => OVERDUE)
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

  // Sophia Chen (SMS-2025-0002): Fully paid in 2 installments ($4,500 + $4,500 => PAID, 2 receipts)
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

  // Marcus Adebayo (SMS-2025-0003): Partially paid ($2,000 / $7,500, due 2025-09-30 => OVERDUE)
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

  // Elena Rostova (SMS-2025-0004): Partially paid ($2,500 / $7,500, due 2026-01-15 => OVERDUE)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-ROS-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[3].feeId,
      amount: 2500.0,
      referenceNumber: "TXN-ROS-001",
      paidAt: new Date("2025-12-20"),
    },
  });

  // Jordan Taylor (SMS-2025-0005): Withdrawn, never paid (due 2025-11-30 => OVERDUE full balance)
  // (no payments)

  // Priya Patel (SMS-2025-0006): Completed student fully settled ($9,000 => PAID)
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

  // Liam O'Connor (SMS-2025-0007): Partially paid in 2 installments ($1,000 + $2,000 / $9,000, due 2025-12-01 => OVERDUE, 2 receipts)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-OCON-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[6].feeId,
      amount: 1000.0,
      referenceNumber: "TXN-OCON-001",
      paidAt: new Date("2025-10-05"),
    },
  });
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-OCON-002" },
    update: {},
    create: {
      studentFeeId: createdStudents[6].feeId,
      amount: 2000.0,
      referenceNumber: "TXN-OCON-002",
      paidAt: new Date("2025-11-10"),
    },
  });

  // Aisha Khan (SMS-2025-0008): Half paid ($4,750 / $9,500, due 2026-02-15 => PARTIAL)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-KHAN-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[7].feeId,
      amount: 4750.0,
      referenceNumber: "TXN-KHAN-001",
      paidAt: new Date("2026-01-20"),
    },
  });

  // Diego Fernandez (SMS-2025-0009): Nothing paid yet, future due date (due 2026-04-10 => PARTIAL, no receipts)
  // (no payments)

  // Grace Kim (SMS-2025-0010): Settled early in one payment ($9,000 => PAID)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-KIM-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[9].feeId,
      amount: 9000.0,
      referenceNumber: "TXN-KIM-001",
      paidAt: new Date("2025-11-25"),
    },
  });

  // Noah Williams (SMS-2025-0011): Mostly paid ($6,000 / $9,500, due 2025-08-15 => OVERDUE)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-WILL-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[10].feeId,
      amount: 6000.0,
      referenceNumber: "TXN-WILL-001",
      paidAt: new Date("2025-07-01"),
    },
  });

  // Fatima Hassan (SMS-2025-0012): Small installment ($1,500 / $7,500, due 2026-06-01 => PARTIAL)
  await prisma.payment.upsert({
    where: { referenceNumber: "TXN-HASS-001" },
    update: {},
    create: {
      studentFeeId: createdStudents[11].feeId,
      amount: 1500.0,
      referenceNumber: "TXN-HASS-001",
      paidAt: new Date("2026-02-28"),
    },
  });

  // 6. Assessments (7 past deadlines + 4 upcoming, spread across all three programmes)
  // Past deadline submissions stay gradeable; future ones drive the student deadline panels.
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

  await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      moduleId: cs103.id,
      title: "Lab Report: Cloud Services & Microservices Deployment",
      deadline: new Date("2026-05-15T23:59:00Z"),
    },
  });

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

  await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000005" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000005",
      moduleId: cs101.id,
      title: "Coursework 2: REST API Design & Integration Testing",
      deadline: new Date("2026-06-30T23:59:00Z"),
    },
  });

  const asm6 = await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000006" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000006",
      moduleId: bus102.id,
      title: "Midterm: Financial Accounting & Reporting",
      deadline: new Date("2026-08-20T17:00:00Z"),
    },
  });

  const asm7 = await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000007" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000007",
      moduleId: ds101.id,
      title: "Coursework: Regression & Classification Models",
      deadline: new Date("2026-09-25T23:59:00Z"),
    },
  });

  await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000008" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000008",
      moduleId: cs103.id,
      title: "Group Project: Microservices Capstone",
      deadline: new Date("2026-11-15T23:59:00Z"),
    },
  });

  await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-000000000009" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000009",
      moduleId: ds102.id,
      title: "Report: Big Data Pipeline Engineering",
      deadline: new Date("2026-12-10T23:59:00Z"),
    },
  });

  await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-00000000000a" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-00000000000a",
      moduleId: bus102.id,
      title: "Analysis: Corporate Financial Statements",
      deadline: new Date("2027-01-15T17:00:00Z"),
    },
  });

  await prisma.assessment.upsert({
    where: { id: "00000000-0000-0000-0000-00000000000b" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-00000000000b",
      moduleId: cs102.id,
      title: "Coursework: Distributed Query Optimization",
      deadline: new Date("2026-11-28T23:59:00Z"),
    },
  });

  // 7. Submissions, Versions, and Graded Results
  // Helper keeps the 13 cases below terse; every case is idempotent via natural keys.
  async function upsertSubmission(
    studentIndex: number,
    assessmentId: string,
    versions: Array<{
      versionNumber: number;
      fileName: string;
      storageKey: string;
      mimeType: string;
      fileSize: number;
      submittedAt: Date;
    }>,
    result?: { grade: number; isPublished: boolean; gradedAt: Date }
  ) {
    const submission = await prisma.submission.upsert({
      where: {
        studentId_assessmentId: {
          studentId: createdStudents[studentIndex].id,
          assessmentId,
        },
      },
      update: {},
      create: {
        studentId: createdStudents[studentIndex].id,
        assessmentId,
      },
    });

    for (const v of versions) {
      await prisma.submissionVersion.upsert({
        where: {
          submissionId_versionNumber: {
            submissionId: submission.id,
            versionNumber: v.versionNumber,
          },
        },
        update: {},
        create: {
          submissionId: submission.id,
          ...v,
        },
      });
    }

    if (result) {
      await prisma.assessmentResult.upsert({
        where: { submissionId: submission.id },
        update: {
          grade: result.grade,
          isPublished: result.isPublished,
        },
        create: {
          submissionId: submission.id,
          grade: result.grade,
          isPublished: result.isPublished,
          gradedAt: result.gradedAt,
        },
      });
    }
  }

  const PDF = "application/pdf";
  const DOCX =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  // --- CS101 CW1 (asm1, deadline 2025-11-20) ---

  // Sophia Chen: On-time, single version, 85 Distinction, PUBLISHED
  await upsertSubmission(
    1,
    asm1.id,
    [
      {
        versionNumber: 1,
        fileName: "Sophia_Chen_CS101_CW1.pdf",
        storageKey: "/uploads/submissions/seed_sophia_cs101.pdf",
        mimeType: PDF,
        fileSize: 1024 * 350,
        submittedAt: new Date("2025-11-18T14:30:00Z"),
      },
    ],
    { grade: 85.0, isPublished: true, gradedAt: new Date("2025-11-25") }
  );

  // Alex Rivera: 2 versions (v1 on-time, v2 resubmitted 3h late), 68 Merit, WITHHELD
  await upsertSubmission(
    0,
    asm1.id,
    [
      {
        versionNumber: 1,
        fileName: "Alex_Rivera_Draft_CS101.docx",
        storageKey: "/uploads/submissions/seed_alex_cs101_v1.docx",
        mimeType: DOCX,
        fileSize: 1024 * 120,
        submittedAt: new Date("2025-11-20T21:00:00Z"),
      },
      {
        versionNumber: 2,
        fileName: "Alex_Rivera_Final_CS101.pdf",
        storageKey: "/uploads/submissions/seed_alex_cs101_v2.pdf",
        mimeType: PDF,
        fileSize: 1024 * 450,
        submittedAt: new Date("2025-11-21T03:15:00Z"), // Late by 3h 16m
      },
    ],
    { grade: 68.0, isPublished: false, gradedAt: new Date("2025-11-26") }
  );

  // Liam O'Connor: Single version submitted AFTER the deadline, 70 Distinction (boundary), WITHHELD
  await upsertSubmission(
    6,
    asm1.id,
    [
      {
        versionNumber: 1,
        fileName: "Liam_OConnor_CS101_CW1.pdf",
        storageKey: "/uploads/submissions/seed_liam_cs101.pdf",
        mimeType: PDF,
        fileSize: 1024 * 280,
        submittedAt: new Date("2025-11-21T09:00:00Z"), // Late by 9h
      },
    ],
    { grade: 70.0, isPublished: false, gradedAt: new Date("2025-11-28") }
  );

  // Grace Kim: 2 versions, both on-time (draft + final), 91 Distinction, PUBLISHED
  await upsertSubmission(
    9,
    asm1.id,
    [
      {
        versionNumber: 1,
        fileName: "Grace_Kim_CS101_Draft.docx",
        storageKey: "/uploads/submissions/seed_grace_cs101_v1.docx",
        mimeType: DOCX,
        fileSize: 1024 * 150,
        submittedAt: new Date("2025-11-19T10:00:00Z"),
      },
      {
        versionNumber: 2,
        fileName: "Grace_Kim_CS101_Final.pdf",
        storageKey: "/uploads/submissions/seed_grace_cs101_v2.pdf",
        mimeType: PDF,
        fileSize: 1024 * 390,
        submittedAt: new Date("2025-11-20T20:00:00Z"),
      },
    ],
    { grade: 91.0, isPublished: true, gradedAt: new Date("2025-11-27") }
  );

  // Priya Patel (completed student): On-time, 78 Distinction, PUBLISHED
  await upsertSubmission(
    5,
    asm1.id,
    [
      {
        versionNumber: 1,
        fileName: "Priya_Patel_CS101_CW1.pdf",
        storageKey: "/uploads/submissions/seed_priya_cs101.pdf",
        mimeType: PDF,
        fileSize: 1024 * 410,
        submittedAt: new Date("2025-11-19T16:45:00Z"),
      },
    ],
    { grade: 78.0, isPublished: true, gradedAt: new Date("2025-11-24") }
  );

  // --- CS102 Portfolio (asm2, deadline 2025-12-10) ---

  // Sophia Chen: On-time, 92 Distinction, PUBLISHED
  await upsertSubmission(
    1,
    asm2.id,
    [
      {
        versionNumber: 1,
        fileName: "Sophia_Chen_CS102_PostgreSQL.pdf",
        storageKey: "/uploads/submissions/seed_sophia_cs102.pdf",
        mimeType: PDF,
        fileSize: 1024 * 600,
        submittedAt: new Date("2025-12-09T16:00:00Z"),
      },
    ],
    { grade: 92.0, isPublished: true, gradedAt: new Date("2025-12-14") }
  );

  // Alex Rivera: On-time, 45 Pass, PUBLISHED
  await upsertSubmission(
    0,
    asm2.id,
    [
      {
        versionNumber: 1,
        fileName: "Alex_Rivera_CS102_Portfolio.pdf",
        storageKey: "/uploads/submissions/seed_alex_cs102.pdf",
        mimeType: PDF,
        fileSize: 1024 * 500,
        submittedAt: new Date("2025-12-08T11:30:00Z"),
      },
    ],
    { grade: 45.0, isPublished: true, gradedAt: new Date("2025-12-15") }
  );

  // --- BUS101 Case Study (asm4, deadline 2025-11-30) ---

  // Marcus Adebayo: On-time, Awaiting Grading (UNGRADED)
  await upsertSubmission(2, asm4.id, [
    {
      versionNumber: 1,
      fileName: "Marcus_Adebayo_BUS101_CaseStudy.docx",
      storageKey: "/uploads/submissions/seed_marcus_bus101.docx",
      mimeType: DOCX,
      fileSize: 1024 * 210,
      submittedAt: new Date("2025-11-29T10:00:00Z"),
    },
  ]);

  // Diego Fernandez: Submitted 1 day LATE, 40 Pass (boundary), PUBLISHED
  await upsertSubmission(
    8,
    asm4.id,
    [
      {
        versionNumber: 1,
        fileName: "Diego_Fernandez_BUS101_CaseStudy.pdf",
        storageKey: "/uploads/submissions/seed_diego_bus101.pdf",
        mimeType: PDF,
        fileSize: 1024 * 260,
        submittedAt: new Date("2025-12-01T18:00:00Z"), // Late by 1 day
      },
    ],
    { grade: 40.0, isPublished: true, gradedAt: new Date("2025-12-05") }
  );

  // Fatima Hassan: On-time, 61 Merit, WITHHELD
  await upsertSubmission(
    11,
    asm4.id,
    [
      {
        versionNumber: 1,
        fileName: "Fatima_Hassan_BUS101_CaseStudy.pdf",
        storageKey: "/uploads/submissions/seed_fatima_bus101.pdf",
        mimeType: PDF,
        fileSize: 1024 * 230,
        submittedAt: new Date("2025-11-28T09:30:00Z"),
      },
    ],
    { grade: 61.0, isPublished: false, gradedAt: new Date("2025-12-03") }
  );

  // --- BUS102 Midterm (asm6, deadline 2026-08-20) ---

  // Elena Rostova (deferred): On-time, Awaiting Grading (UNGRADED)
  await upsertSubmission(3, asm6.id, [
    {
      versionNumber: 1,
      fileName: "Elena_Rostova_BUS102_Midterm.docx",
      storageKey: "/uploads/submissions/seed_elena_bus102.docx",
      mimeType: DOCX,
      fileSize: 1024 * 180,
      submittedAt: new Date("2026-08-19T14:00:00Z"),
    },
  ]);

  // --- DS101 Coursework (asm7, deadline 2026-09-25) ---

  // Aisha Khan: On-time, Awaiting Grading (UNGRADED)
  await upsertSubmission(7, asm7.id, [
    {
      versionNumber: 1,
      fileName: "Aisha_Khan_DS101_Models.pdf",
      storageKey: "/uploads/submissions/seed_aisha_ds101.pdf",
      mimeType: PDF,
      fileSize: 1024 * 320,
      submittedAt: new Date("2026-09-24T08:15:00Z"),
    },
  ]);

  // Noah Williams: On-time, 38 Fail, WITHHELD
  await upsertSubmission(
    10,
    asm7.id,
    [
      {
        versionNumber: 1,
        fileName: "Noah_Williams_DS101_Models.docx",
        storageKey: "/uploads/submissions/seed_noah_ds101.docx",
        mimeType: DOCX,
        fileSize: 1024 * 140,
        submittedAt: new Date("2026-09-23T19:45:00Z"),
      },
    ],
    { grade: 38.0, isPublished: false, gradedAt: new Date("2026-09-28") }
  );

  console.log("-----------------------------------------------------------------");
  console.log("Demo dataset seeded successfully!");
  console.log("Programmes: 3 (BSc Computer Science, BA Business Admin, BSc Data Science & AI)");
  console.log(`Students: ${createdStudents.length} (8 Enrolled, 2 Deferred, 1 Withdrawn, 1 Completed)`);
  console.log("Fees: 12 accounts -> 3 PAID, 6 OVERDUE, 3 PARTIAL (incl. 1 with zero payments)");
  console.log("Assessments: 11 (7 past deadlines, 4 upcoming across CS/BUS/DS)");
  console.log("Submissions: 13 -> 6 published, 4 withheld, 3 ungraded; late, multi-version, and boundary grades (70/40) included");
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
