# Student Management System (Registry Module)

A production-grade, full-stack Student Management System focused on the core **Registry Module** workflows, built with **Next.js 16 (App Router & Turbopack)**, **TypeScript**, **PostgreSQL**, and **Prisma ORM (Prisma 7 with `@prisma/adapter-pg`)**.

---

## 📑 Table of Contents
1. [Overview & Core Registry Workflows](#1-overview--core-registry-workflows)
2. [How to Run Locally](#2-how-to-run-locally)
3. [Environment Variables](#3-environment-variables)
4. [Demo Seed Dataset](#4-demo-seed-dataset)
5. [Edge Cases & Product Decisions](#5-edge-cases--product-decisions)
6. [How AI Was Used During the Build](#6-how-ai-was-used-during-the-build)
7. [Architecture & Technology Stack](#7-architecture--technology-stack)

---

## 1. Overview & Core Registry Workflows

The application models the four daily operational workflows of a Higher Education Registry Office:

1. **Student Enrolment (`/students`)**:
   - Create student records with auto-generated unique Student IDs (`SMS-YYYY-XXXX`).
   - Manage enrolment lifecycles (`ENROLLED`, `DEFERRED`, `WITHDRAWN`, `COMPLETED`).
   - Debounced search & filter across names, IDs, programmes, and cohort statuses.
   - Automatically assigns standard programme tuition fees upon enrolment.

2. **Fees & Payments Ledger (`/fees`)**:
   - Programme-specific standard fee assignment.
   - Idempotent payment recording with unique transaction reference checks.
   - Real-time outstanding balance calculation (`balance = amountDue - totalPaid`).
   - Automated overdue flagging (`dueDate < now && balance > 0`) with day-count tracking.
   - Itemized receipt history modal for audit compliance.

3. **Curriculum Assessments & Submissions (`/assessments` & `/student-assessments`)**:
   - **Staff**: Create assessments with target module selection and submission deadlines; inspect student submissions with late detection flags and version history.
   - **Student**: View assigned assessments, drag-and-drop document upload (strictly `.pdf` and `.docx`, max 10MB), resubmission support before deadlines with automated version increment (`v1`, `v2`, etc.), and visual banners for late submissions.

4. **Marksheet & Academic Results (`/results` & `/marksheet`)**:
   - Staff grade submissions on a numeric scale (0–100) with automatic classification:
     - $\ge 70$: **Distinction**
     - $\ge 60$: **Merit**
     - $\ge 40$: **Pass**
     - $< 40$: **Fail**
   - **Zero-Leak Policy**: Per-student **Publish / Withhold** toggle. Students only see certified, published results; withheld or un-graded submissions display a discreet administrative notice.

5. **Registry Dashboards (`/dashboard` & `/student-dashboard`)**:
   - **Staff Dashboard**: Executive KPI cards, priority overdue accounts panel with direct "Record Payment" modal action, recent student submissions feed, and assessment deadlines schedule.
   - **Student Dashboard**: Personalized student welcome banner, live tuition balance with overdue warning, submission progress count, certified GPA standing, and assessment timetable.

---

## 2. How to Run Locally

### Prerequisites
- **Node.js**: `v20.x` or `v18.18.0+`
- **PostgreSQL**: Local server or cloud PostgreSQL database (e.g. Supabase, Neon, or local Postgres)
- **npm** (v9+)

### Installation & Startup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RamprosadG/student-management-system.git
   cd student-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your environment file:**
   Create a `.env` file from the example template:
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # Linux/macOS:
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your PostgreSQL credentials.

4. **Run database migrations & generate Prisma client:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Load the comprehensive demo seed dataset:**
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

7. **Production Build Verification (Optional):**
   ```bash
   npm run build
   npm run start
   ```

---

## 3. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma ORM with `@prisma/adapter-pg` driver | `postgresql://postgres:password@localhost:5432/sms_db?schema=public` |

---

## 4. Demo Seed Dataset

Running `npx tsx prisma/seed.ts` loads a complete demo environment with diverse test cases:

| Student Name | Student ID | Programme | Status | Tuition Fee State | Submissions & Grading |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Alex Rivera** | `SMS-2025-0001` | BSc Computer Science | `ENROLLED` | **Overdue** ($4,000 balance, due Oct 2025) | CS101 CW1 submitted **Late by 3h 15m** (v2); Graded 68% (Merit), **WITHHELD by Registry** |
| **Sophia Chen** | `SMS-2025-0002` | BSc Computer Science | `ENROLLED` | **Paid in Full** ($9,000 paid in 2 receipts) | CS101 CW1: On-time (85% Distinction, Published); CS102 Portfolio: On-time (92% Distinction, Published) |
| **Marcus Adebayo** | `SMS-2025-0003` | BA Business Admin | `ENROLLED` | **Overdue** ($5,500 balance, due Sept 2025) | BUS101 Case Study: Submitted On-Time, **Awaiting Grading (Ungraded)** |
| **Elena Rostova** | `SMS-2025-0004` | BA Business Admin | `DEFERRED` | Partial ($7,500 due Jan 2026) | Enrolment deferred; no active submissions |
| **Jordan Taylor** | `SMS-2025-0005` | BSc Computer Science | `WITHDRAWN` | Invoiced ($9,000) | Withdrawn record preserved for audit tracking |
| **Priya Patel** | `SMS-2025-0006` | BSc Computer Science | `COMPLETED` | **Paid in Full** ($9,000) | Graduated cohort alumnus record |

---

## 5. Edge Cases & Product Decisions

1. **Auto-Generated Unique Student IDs**:
   - Generates IDs following the institutional standard: `SMS-YYYY-XXXX` (e.g. `SMS-2025-0001`).
   - Uses an atomic count query scoped to the current academic year to avoid ID collisions.

2. **Tuition Balance & Overdue Delays**:
   - In real registry systems, students frequently pay in partial installments. The system stores each transaction receipt independently and computes balances dynamically.
   - Accounts are flagged **OVERDUE** when `dueDate < now && balance > 0`, calculating the exact elapsed day delay.

3. **Submissions, Resubmissions & Versioning**:
   - Submissions are restricted strictly to academic document formats: `.pdf` and `.docx` with a 10MB limit.
   - Enforces a single submission container per student per assessment (`@@unique([studentId, assessmentId])`) while recording version history in `SubmissionVersion`.
   - Late submissions are accepted pursuant to university policy but visually flagged with precise elapsed delay (e.g., `Late by 3h 15m`).

4. **Zero-Leak Policy for Academic Grades**:
   - Registry administrators and faculty frequently draft grades before formal examination board ratification.
   - Student queries execute through strict filtering: if `isPublished === false` or un-evaluated, student marksheets and dashboards display a discreet notice ("Withheld by Registry") without leaking scores.

5. **Smart Role Switcher & Impersonation**:
   - Includes a persistent top navigation role switcher (`Staff View` $\leftrightarrow$ `Student View`).
   - In Student View, a dropdown allows instantaneous switching between any student in the database to test different cohort standings, overdue states, and transcripts without authenticating.

---

## 6. How AI Was Used During the Build

This project was built using a disciplined, human-in-the-loop engineering methodology. AI tools were leveraged as an accelerator, sparring partner, and automated auditor, while core architectural decisions, requirement synthesis, and quality verification remained strictly human-owned.

### 1. Independent Analysis & AI Cross-Evaluation
- **Human-Led Baseline**: Conducted an initial, independent review of the technical assessment brief to deconstruct functional requirements, identify registry domain edge cases, sketch an initial relational database schema, and design the multi-tier application architecture.
- **AI Comparative Analysis**: Tasked AI with performing an independent requirement analysis, database schema proposal, and architectural layout based on the same brief.
- **Synthesis & Selection**: Systematically compared the human-designed baseline against the AI proposals. Evaluated architectural trade-offs (e.g., dedicated receipt ledgers vs. monolithic balance fields, single submission containers with version histories, and role-based zero-leak data boundaries) to select and refine the most robust, maintainable architecture.

### 2. Implementation Planning & Inconsistency Auditing
- **Iterative Roadmap Generation**: Formulated a structured, step-by-step implementation plan with AI to sequence database modeling, API route development, UI primitives, and domain feature slices.
- **Critical Review & Refinement**: Rigorously audited the plan for potential oversights, architectural gaps, and state synchronization issues. Adjusted and corrected inconsistencies before writing code to ensure a seamless implementation trajectory.

### 3. Step-by-Step Feature Implementation & Manual QA
- **Incremental Development**: Implemented the project sequentially across discrete modules (Student Enrolment, Fees & Payments Ledger, Assessment Submissions & Versioning, Marksheets & Results, and Executive Dashboards).
- **Per-Feature Manual Verification**: Following the completion of each feature, conducted thorough manual functional testing, validating edge cases, form error states, and responsive styling. Any bugs or regressions were resolved immediately before advancing to the next phase.

### 4. Multi-Model Cross-Verification & Final Hardening
- **Secondary Model Audit**: Upon completing the full-stack implementation, engaged an alternative AI model to review the complete codebase, audit requirement completeness, and verify query patterns and performance indexes.
- **End-to-End Testing & Polish**: Addressed all identified findings, performed comprehensive cross-role manual testing (Staff vs. Student portals, role switching, file upload validations, overdue balance logic, and publication flags), and verified zero build or type errors.

> **Takeaway**: AI expedited boilerplate generation, edge-case discovery, and code auditing, but full ownership of the architecture, code quality, and user experience was maintained through rigorous hands-on validation.

---

## 7. Architecture & Technology Stack

```text
src/
├── app/
│   ├── (staff)/             # Staff portal: /dashboard, /students, /fees, /assessments, /results
│   ├── (student)/           # Student portal: /student-dashboard, /student-assessments, /marksheet
│   ├── api/                 # Next.js API Route Handlers (RESTful CRUD)
│   ├── layout.tsx           # Global app layout shell with persistent sidebar
│   └── page.tsx             # Public landing directory
├── features/                # Domain feature slices (forms, modals, inspectors)
│   ├── students/
│   ├── fees/
│   ├── assessments/
│   └── results/
├── server/
│   ├── services/            # Business workflows & cross-entity orchestration
│   ├── repositories/        # Prisma data access queries
│   └── policies/            # Role and publication visibility rules
├── components/
│   ├── ui/                  # Reusable UI primitives (buttons, inputs, tables, badges, modals, stats)
│   └── shared/              # Persistent shell, Sidebar, Navbar, and RoleContext
└── lib/
    ├── prisma.ts            # PrismaClient singleton with @prisma/adapter-pg
    ├── utils.ts             # Currency, date, and string formatting
    └── validations/         # Zod schemas for input validation
```

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `react-icons`
- **Backend**: Next.js Route Handlers, Zod Validation, Node.js File System Uploads
- **Database**: PostgreSQL with Prisma ORM 7 (`@prisma/adapter-pg`)
