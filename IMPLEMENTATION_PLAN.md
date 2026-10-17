# Implementation Plan: Student Management System (Registry Module)

This document tracks the step-by-step implementation of the Student Management System. Each phase follows a **UI Layout First $\rightarrow$ Real API & Database Integration $\rightarrow$ Verification & Commit** pattern.

---

## 📊 Overall Progress Summary

- [x] **Step 0: Base Seed & Global UI Shell** *(Completed)*
- [ ] **Step 1: Student Enrolment Page & API** *(Next)*
- [ ] **Step 2: Fees & Payments Page & API**
- [ ] **Step 3: Staff Assessments Management**
- [ ] **Step 4: Student Assessment Submission & Dropzone**
- [ ] **Step 5: Marksheet & Results (Staff Grading & Student View)**
- [ ] **Step 6: Registry Staff Dashboard**
- [ ] **Step 7: Final Polish, Full Demo Seed & Documentation**

---

## 🛠️ Detailed Step Breakdown

### Step 0: Base Seed & Global UI Shell
**Goal**: Establish app layout shell, navigation bar, role switcher (`Staff View` $\leftrightarrow$ `Student View`), and baseline reference data in PostgreSQL.

- [x] **0.1 Baseline Database Seed**:
  - [x] Create `prisma/seed.ts` with initial Programmes (e.g. *BSc Computer Science*, *BA Business Administration*) and Academic Years (*2025/2026*).
  - [x] Add `"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json` and `prisma.config.ts`.
  - [x] Run seed and verify PostgreSQL data (`npx prisma db seed`).
- [x] **0.2 Shared UI Layout & Navigation**:
  - [x] Create `src/components/shared/RoleContext.tsx` with role state (`staff` $\leftrightarrow$ `student`), selected student impersonator, and mobile sidebar state.
  - [x] Create persistent desktop sidebar and mobile slide-in drawer in `src/components/shared/Sidebar.tsx` using `react-icons` with clean active/hover indicators.
  - [x] Create top header in `src/components/shared/Navbar.tsx` featuring mobile hamburger button, student selector, and role switcher with **Standard A (Smart Redirection)**.
  - [x] Configure `src/app/layout.tsx` with dual-pane layout (`Sidebar` + `Navbar` + `main`).
  - [x] Create modern enterprise landing page in `src/app/page.tsx`.
  - [x] Stub out all staff and student routes with responsive page containers.
- [x] **0.3 Verification & Commit**:
  - [x] Run `npm run build` to verify zero TypeScript errors and successful static page generation across all 12 routes.
  - [ ] *(Pending user commit)* Commit message: `feat: setup app shell layout, role switcher, and initial seed data`

---

### Step 1: Feature 1 – Student Enrolment Page & API
**Goal**: Complete lifecycle for creating, listing, searching, and filtering student records with auto-generated IDs.

- [ ] **1.1 Backend / API Layer**:
  - [ ] Create validation schema in `src/lib/validations/student.ts` (Full name, Email, DOB, Programme, Academic Year, Enrolment Status).
  - [ ] Create repository functions in `src/server/repositories/student.repository.ts`.
  - [ ] Implement auto-generated unique Student ID service (`SMS-YYYY-XXXX`) with transaction safety in `src/server/services/student.service.ts`.
  - [ ] Create Route Handlers:
    - `GET /api/students`: Filter by search term (name/ID), programme, and enrolment status.
    - `POST /api/students`: Validate input, generate ID, create student, and auto-assign programme fee.
- [ ] **1.2 UI Layer (`src/app/(staff)/students/page.tsx`)**:
  - [ ] Interactive Student Directory Table (ID, Full Name, Email, Programme, Academic Year, Status badge).
  - [ ] Debounced search bar + Programme & Status filter dropdowns.
  - [ ] "Enrol New Student" modal/drawer with real-time validation and error handling.
- [ ] **1.3 Verification & Commit**:
  - [ ] Enrol new students, test filters, verify auto-generated ID format and database records.
  - [ ] Commit message: `feat(students): implement student enrolment page and api with auto-id generation`

---

### Step 2: Feature 2 – Fees & Payments Page & API
**Goal**: Track programme fee assignments, payment recording, real-time balance calculations, and overdue flags.

- [ ] **2.1 Backend / API Layer**:
  - [ ] Create fee & payment schemas in `src/lib/validations/fee.ts`.
  - [ ] Implement repository & service logic in `src/server/repositories/fee.repository.ts` and `src/server/services/fee.service.ts`.
  - [ ] Create Route Handlers:
    - `GET /api/fees`: Return students with fee amount, sum of payments, and outstanding balance.
    - `POST /api/payments`: Record transaction with unique reference validation and idempotent checks.
- [ ] **2.2 UI Layer (`src/app/(staff)/fees/page.tsx`)**:
  - [ ] Financial KPI cards: Total Invoiced, Total Collected, Outstanding Balance, Overdue Count.
  - [ ] Fee Ledger Table with status pills: `Paid` (green), `Partial` (amber), `Overdue` (red alert).
  - [ ] "Record Payment" modal with amount, date, reference number, and validation against balance.
  - [ ] Payment history drawer showing itemized receipts.
- [ ] **2.3 Verification & Commit**:
  - [ ] Record payments, verify balance updates, test overdue status calculation (`dueDate < now && balance > 0`).
  - [ ] Commit message: `feat(fees): implement fee tracking, payment recording, and balance calculations`

---

### Step 3: Feature 3A – Staff Assessment Management
**Goal**: Staff can create assessments, assign them to modules, and inspect student submissions with late detection flags.

- [ ] **3.1 Backend / API Layer**:
  - [ ] Create assessment validation schema in `src/lib/validations/assessment.ts`.
  - [ ] Create repository & service logic in `src/server/repositories/assessment.repository.ts` and `src/server/services/assessment.service.ts`.
  - [ ] Create Route Handlers:
    - `GET /api/assessments`: Fetch assessments grouped by module with submission counts.
    - `POST /api/assessments`: Create assessment with title, module, and deadline.
- [ ] **3.2 UI Layer (`src/app/(staff)/assessments/page.tsx`)**:
  - [ ] Assessment directory cards with deadline indicators and module tags.
  - [ ] "Create Assessment" modal with datetime picker.
  - [ ] Submission inspector view: Table of submissions per assessment with version counts and visual flags:
    - 🟢 *On-time submission*
    - 🔴 *Late submission* with elapsed time (e.g. "Late by 2h 15m").
- [ ] **3.3 Verification & Commit**:
  - [ ] Create assessments, test API routes, verify database records.
  - [ ] Commit message: `feat(assessments): implement staff assessment creation and submission inspection`

---

### Step 4: Feature 3B – Student Assessment & Submission Dropzone
**Goal**: Students can view assigned assessments, upload PDF/DOCX files, resubmit before deadlines, and handle late submissions gracefully.

- [ ] **4.1 Backend / API Layer**:
  - [ ] Create submission schema in `src/lib/validations/submission.ts`.
  - [ ] Implement file upload handling with versioning (`SubmissionVersion` relation).
  - [ ] Auto-calculate `isLate` by comparing `submittedAt > assessment.deadline`.
  - [ ] Create Route Handlers:
    - `GET /api/submissions`: Retrieve current student's submissions and versions.
    - `POST /api/submissions`: Handle multipart upload, increment version number, save record.
- [ ] **4.2 UI Layer (`src/app/(student)/assessments/page.tsx`)**:
  - [ ] Student assessment list filtered to their enrolled programme modules.
  - [ ] Drag-and-drop file upload zone restricting files to `.pdf` and `.docx`.
  - [ ] Resubmission capability before deadline with version history display.
  - [ ] Visual alert banner if uploading past the deadline.
- [ ] **4.3 Verification & Commit**:
  - [ ] Test on-time upload, test resubmission (version increments), test post-deadline upload and verify late badge.
  - [ ] Commit message: `feat(submissions): implement student assessment submission dropzone with versioning and late detection`

---

### Step 5: Feature 4 – Marksheet & Results (Staff Grading & Student View)
**Goal**: Staff grade submissions (0–100) with auto-classification and publish/withhold controls; students view published academic marksheet.

- [ ] **5.1 Backend / API Layer**:
  - [ ] Create grading schema in `src/lib/validations/result.ts`.
  - [ ] Implement grading repository & service in `src/server/services/result.service.ts` with classification rules:
    - $\ge 70$: **Distinction**
    - $\ge 60$: **Merit**
    - $\ge 40$: **Pass**
    - $< 40$: **Fail**
  - [ ] Create Route Handlers:
    - `POST /api/results`: Save/update score, classification, and `isPublished` toggle.
    - `GET /api/results`: Staff view gets all; Student view gets **only published** results.
- [ ] **5.2 Staff UI (`src/app/(staff)/results/page.tsx`)**:
  - [ ] Grade entry table with instant classification pill preview.
  - [ ] Per-student **Publish / Withhold** toggle button with visual status indicators.
- [ ] **5.3 Student UI (`src/app/(student)/marksheet/page.tsx`)**:
  - [ ] Academic transcript card view with module titles, grades, and classification badges.
  - [ ] Explicit placeholder/notice for unpublished or withheld grades (zero leak of draft grades).
- [ ] **5.4 Verification & Commit**:
  - [ ] Enter grades, test all classification thresholds, test withhold/publish toggle and verify student visibility.
  - [ ] Commit message: `feat(results): implement grading sheet, auto-classification, and student marksheet with publish controls`

---

### Step 6: Registry Staff Dashboard
**Goal**: High-impact administrative command center synthesizing KPIs, overdue alerts, and urgent tasks.

- [ ] **6.1 Data Aggregation Layer**:
  - [ ] Implement dashboard service aggregating counts, outstanding debts, and pending grades.
- [ ] **6.2 UI Layer (`src/app/(staff)/dashboard/page.tsx`)**:
  - [ ] KPI cards: Total Enrolled Students, Total Outstanding Fees, Overdue Accounts, Pending Grading count.
  - [ ] Priority Alert Panel: High-visibility list of overdue students with quick "Record Payment" action.
  - [ ] Recent activity feeds: Recent submissions (highlighting late ones) and upcoming deadlines.
- [ ] **6.3 Verification & Commit**:
  - [ ] Verify live numbers match actual database records.
  - [ ] Commit message: `feat(dashboard): implement registry staff dashboard with real-time KPI metrics and alerts`

---

### Step 7: Final Polish, Full Demo Seed & Documentation
**Goal**: Fulfill all assessment submission criteria (at least 5 students, 2 programmes, fees, sample grades, README with AI articulation).

- [ ] **7.1 Comprehensive Demo Seed (`prisma/seed.ts`)**:
  - [ ] Populate at least 5 students with varied statuses (*Enrolled*, *Deferred*, *Withdrawn*, *Completed*).
  - [ ] Create fees with diverse states: fully paid, partially paid, and overdue.
  - [ ] Create assessments, submissions (on-time and late), and graded results (Pass, Merit, Distinction, and Withheld).
  - [ ] Run `npx prisma db seed` cleanly.
- [ ] **7.2 README Documentation**:
  - [ ] Instructions to run locally (`npm install`, `.env`, `prisma migrate`, `npm run dev`).
  - [ ] Environment variable documentation.
  - [ ] Clear documentation on AI usage and prompt-engineering strategies during the build.
  - [ ] Walkthrough of product decisions and edge case handling (overdue fees, late submissions, withheld grades).
- [ ] **7.3 Build & Codebase Verification**:
  - [ ] Run `npm run build` and ensure clean output with zero errors.
  - [ ] Commit message: `docs: update readme with full workflow guides, edge case analysis, and demo seed data`
