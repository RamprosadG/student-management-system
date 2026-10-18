# Implementation Plan: Student Management System (Registry Module)

This document tracks the step-by-step implementation of the Student Management System. Each phase follows a **UI Layout First $\rightarrow$ Real API & Database Integration $\rightarrow$ Verification & Commit** pattern.

---

## 📊 Overall Progress Summary

- [x] **Step 0: Base Seed & Global UI Shell** *(Completed)*
- [x] **Step 1: Student Enrolment Page & API** *(Completed)*
- [x] **Step 2: Fees & Payments Page & API** *(Completed)*
- [x] **Step 3: Staff Assessments Management** *(Completed)*
- [x] **Step 4: Student Assessment Submission & Dropzone** *(Completed)*
- [x] **Step 5: Marksheet & Results (Staff Grading & Student View)** *(Completed)*
- [x] **Step 6: Registry Staff & Student Dashboards** *(Completed)*
- [x] **Step 7: Final Polish, Full Demo Seed & Documentation** *(Completed)*

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
  - [x] Commit message: `feat: setup app shell layout, role switcher, and initial seed data`

---

### Step 1: Feature 1 – Student Enrolment Page & API
**Goal**: Complete lifecycle for creating, listing, searching, and filtering student records with auto-generated IDs.

- [x] **1.1 Backend / API Layer**:
  - [x] Create validation schema in `src/lib/validations/student.ts` (Full name, Email, DOB, Programme, Academic Year, Enrolment Status).
  - [x] Create repository functions in `src/server/repositories/student.repository.ts`.
  - [x] Implement auto-generated unique Student ID service (`SMS-YYYY-XXXX`) with transaction safety in `src/server/services/student.service.ts`.
  - [x] Create Route Handlers:
    - `GET /api/students`: Filter by search term (name/ID), programme, and enrolment status.
    - `POST /api/students`: Validate input, generate ID, create student, and auto-assign programme fee.
- [x] **1.2 UI Layer (`src/app/(staff)/students/page.tsx`)**:
  - [x] Replicate reusable UI components from `spend-smart-frontend`: `Button`, `Input`, `SearchInput`, `Dropdown`, `Badge`, `DataTable`, `Modal`, and `Alerts`.
  - [x] Interactive Student Directory Table (ID, Full Name, Email, Programme, Academic Year, Status badge).
  - [x] Debounced search bar + Programme & Status filter dropdowns.
  - [x] "Enrol New Student" modal/drawer with real-time validation and error handling.
  - [x] "Manage Student Record" modal allowing Registry staff to update details and transition enrolment statuses (`ENROLLED`, `DEFERRED`, `WITHDRAWN`, `COMPLETED`).
- [x] **1.3 Verification & Commit**:
  - [x] Enrol new students, test filters, verify auto-generated ID format and database records.
  - [x] Verify status transition and student record updates via `PATCH /api/students`.
  - [ ] *(Pending user commit)* Commit message: `feat(students): implement student enrolment page, api, and status management`

---

### Step 2: Feature 2 – Fees & Payments Page & API
**Goal**: Track programme fee assignments, payment recording, real-time balance calculations, and overdue flags.

- [x] **2.1 Backend / API Layer**:
  - [x] Create fee & payment schemas in `src/lib/validations/fee.ts`.
  - [x] Implement repository & service logic in `src/server/repositories/fee.repository.ts` and `src/server/services/fee.service.ts`.
  - [x] Create Route Handlers:
    - `GET /api/fees`: Return students with fee amount, sum of payments, and outstanding balance.
    - `POST /api/payments`: Record transaction with unique reference validation and idempotent checks.
- [x] **2.2 UI Layer (`src/app/(staff)/fees/page.tsx`)**:
  - [x] Financial KPI cards: Total Invoiced, Total Collected, Outstanding Balance, Overdue Count using `StatCard`.
  - [x] Fee Ledger Table with status pills: `Paid` (green), `Partial` (amber), `Overdue` (red alert).
  - [x] "Record Payment Transaction" modal with balance preview, validation against overpayment, and full-width buttons.
  - [x] Itemized transaction receipt history modal.
- [x] **2.3 Verification & Commit**:
  - [x] Record payments, verify balance updates, test overdue status calculation (`dueDate < now && balance > 0`).
  - [ ] *(Pending user commit)* Commit message: `feat(fees): implement fee tracking, payment recording, and balance calculations`

---

### Step 3: Feature 3A – Staff Assessment Management
**Goal**: Staff can create assessments, assign them to modules, and inspect student submissions with late detection flags.

- [x] **3.1 Backend / API Layer**:
  - [x] Create assessment validation schema in `src/lib/validations/assessment.ts`.
  - [x] Create repository & service logic in `src/server/repositories/assessment.repository.ts` and `src/server/services/assessment.service.ts`.
  - [x] Create Route Handlers:
    - `GET /api/assessments`: Fetch assessments grouped by module with submission counts.
    - `POST /api/assessments`: Create assessment with title, module, and deadline.
- [x] **3.2 UI Layer (`src/app/(staff)/assessments/page.tsx`)**:
  - [x] Assessment directory cards with deadline indicators and module tags.
  - [x] "Create Assessment" modal with datetime picker.
  - [x] Submission inspector view: Table of submissions per assessment with version counts and visual flags:
    - 🟢 *On-time submission*
    - 🔴 *Late submission* with elapsed time (e.g. "Late by 2h 15m").
- [x] **3.3 Verification & Commit**:
  - [x] Create assessments, test API routes, verify database records.
  - [ ] *(Pending user commit)* Commit message: `feat(assessments): implement staff assessment creation and submission inspection`

---

### Step 4: Feature 3B – Student Assessment & Submission Dropzone
**Goal**: Students can view assigned assessments, upload PDF/DOCX files, resubmit before deadlines, and handle late submissions gracefully.

- [x] **4.1 Backend / API Layer**:
  - [x] Create submission schema in `src/lib/validations/submission.ts`.
  - [x] Implement file upload handling with versioning (`SubmissionVersion` relation).
  - [x] Auto-calculate `isLate` by comparing `submittedAt > assessment.deadline`.
  - [x] Create Route Handlers:
    - `GET /api/submissions`: Retrieve current student's submissions and versions.
    - `POST /api/submissions`: Handle multipart upload, increment version number, save record.
- [x] **4.2 UI Layer (`src/app/(student)/student-assessments/page.tsx`)**:
  - [x] Student assessment list filtered to their enrolled programme modules.
  - [x] Drag-and-drop file upload zone restricting files to `.pdf` and `.docx`.
  - [x] Resubmission capability before deadline with version history display.
  - [x] Visual alert banner if uploading past the deadline.
- [x] **4.3 Verification & Commit**:
  - [x] Test on-time upload, test resubmission (version increments), test post-deadline upload and verify late badge.
  - [ ] *(Pending user commit)* Commit message: `feat(submissions): implement student assessment submission dropzone with versioning and late detection`

---

### Step 5: Feature 4 – Marksheet & Results (Staff Grading & Student View)
**Goal**: Staff grade submissions (0–100) with auto-classification and publish/withhold controls; students view published academic marksheet.

- [x] **5.1 Backend / API Layer**:
  - [x] Create grading schema in `src/lib/validations/result.ts`.
  - [x] Implement grading repository & service in `src/server/services/result.service.ts` with classification rules:
    - $\ge 70$: **Distinction**
    - $\ge 60$: **Merit**
    - $\ge 40$: **Pass**
    - $< 40$: **Fail**
  - [x] Create Route Handlers:
    - `POST /api/results`: Save/update score, classification, and `isPublished` toggle.
    - `PATCH /api/results`: Quick toggle publication status.
    - `GET /api/results`: Staff view gets all; Student view gets **only published** results.
- [x] **5.2 Staff UI (`src/app/(staff)/results/page.tsx`)**:
  - [x] Grade entry table with instant classification pill preview.
  - [x] Per-student **Publish / Withhold** toggle button with visual status indicators.
- [x] **5.3 Student UI (`src/app/(student)/marksheet/page.tsx`)**:
  - [x] Academic transcript card view with module titles, grades, and classification badges.
  - [x] Explicit placeholder/notice for unpublished or withheld grades (zero leak of draft grades).
- [x] **5.4 Verification & Commit**:
  - [x] Enter grades, test all classification thresholds, test withhold/publish toggle and verify student visibility.
  - [ ] *(Pending user commit)* Commit message: `feat(results): implement grading sheet, auto-classification, and student marksheet with publish controls`

---

### Step 6: Registry Staff & Student Dashboards
**Goal**: High-impact command centers synthesizing KPIs, alerts, fee balances, and academic progress for both administrative staff and enrolled students.

#### Part 6A: Registry Staff Dashboard *(Completed)*
- [x] **6A.1 Data Aggregation Layer**:
  - [x] Implement dashboard service aggregating counts, outstanding debts, and pending grades.
  - [x] Create Route Handler `GET /api/dashboard`.
- [x] **6A.2 Staff UI Layer (`src/app/(staff)/dashboard/page.tsx`)**:
  - [x] KPI cards: Total Enrolled Students, Total Outstanding Fees, Overdue Accounts, Pending Grading count.
  - [x] Priority Alert Panel: High-visibility list of overdue students with quick "Record Payment" action.
  - [x] Recent activity feeds: Recent submissions (highlighting late ones) and upcoming deadlines.
- [x] **6A.3 Verification & Commit**:
  - [x] Verify live numbers match actual database records.
  - [ ] *(Pending user commit)* Commit message: `feat(dashboard): implement registry staff dashboard with real-time KPI metrics and alerts`

#### Part 6B: Student Portal Dashboard (`src/app/(student)/student-dashboard/page.tsx`) *(Completed)*
**Goal**: Personalized student cockpit summarizing enrolment standing, fee balance & payment history, upcoming deadlines, and published academic progress.

- [x] **6B.1 Data Aggregation Layer**:
  - [x] Extend dashboard service and repository with `findStudentDashboardData` / `getStudentDashboardMetrics`:
    - Enrolled Programme, Academic Year, and Enrolment Status badge (`ENROLLED`, `DEFERRED`, etc.).
    - Real-time Fee Summary: Amount Due, Total Paid, Outstanding Balance, and Due Date with overdue warning if applicable.
    - Assessment & Submission Progress: Completed vs. Pending submissions.
    - Academic Standing: GPA / Average Grade and Overall Classification based strictly on published results.
    - Urgent Action Items: Upcoming assessments due, overdue fee alerts, and unsubmitted assignments.
    - Quick links to "Submit Work", "View Marksheet", and "Tuition Breakdown".
- [x] **6B.2 Student UI Layer (`src/app/(student)/student-dashboard/page.tsx`)**:
  - [x] Student Profile & Programme Hero Banner (Name, Student ID, Programme, Academic Year, Status Badge).
  - [x] 4 Personalized KPI Stat Cards:
    - *Enrolment Standing* (e.g. Active / Enrolled).
    - *Tuition Balance* (Clear currency amount + status badge: Paid / Partial / Overdue).
    - *Assessments Submitted* (e.g. 3 of 4 submitted).
    - *Current Academic Performance* (Average score / Classification preview).
  - [x] Action Items & Urgent Deadlines Feed: Immediate countdown to upcoming submission deadlines with direct "Submit Work" button.
  - [x] Financial Ledger Snapshot: Quick summary of payments made and due date with instructions for registry fee payment.
  - [x] Quick Action Shortcuts: direct navigation cards to Assessment Dropzone and Official Marksheet.
- [x] **6B.3 Verification**:
  - [x] Verify instant hydration when switching students via the student selector dropdown in the navigation header.
  - [x] Verify zero leak of unpublished grades or other students' private fee data.
  - [ ] *(Pending user commit)* Commit message: `feat(dashboard): implement student portal dashboard with tuition ledger, deadlines, and progress KPIs`

---

### Step 7: Final Polish, Full Demo Seed & Documentation
**Goal**: Fulfill all assessment submission criteria (at least 5 students, 2 programmes, fees, sample grades, README with AI articulation).

- [x] **7.1 Comprehensive Demo Seed (`prisma/seed.ts`)**:
  - [x] Populate at least 5 students with varied statuses (*Enrolled*, *Deferred*, *Withdrawn*, *Completed*).
  - [x] Create fees with diverse states: fully paid, partially paid, and overdue.
  - [x] Create assessments, submissions (on-time and late), and graded results (Pass, Merit, Distinction, and Withheld).
  - [x] Run `npx tsx prisma/seed.ts` cleanly.
- [x] **7.2 README Documentation**:
  - [x] Instructions to run locally (`npm install`, `.env`, `prisma migrate`, `npm run dev`).
  - [x] Environment variable documentation.
  - [x] Clear documentation on AI usage and prompt-engineering strategies during the build.
  - [x] Walkthrough of product decisions and edge case handling (overdue fees, late submissions, withheld grades).
- [x] **7.3 Build & Codebase Verification**:
  - [x] Run `npm run build` and ensure clean output with zero errors across all 19 routes.
  - [ ] *(Pending user commit)* Commit message: `docs: update readme with full workflow guides, edge case analysis, and demo seed data`
