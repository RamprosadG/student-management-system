<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Guidelines & Project Architecture

## Project Overview
- **Application**: Student Management System
- **Framework**: Next.js 16+ (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict mode)
- **ORM & Database**: Prisma 7 with `@prisma/adapter-pg` and PostgreSQL
- **Styling**: Tailwind CSS v4 & standard modern CSS

---

## Directory Conventions & Architecture

Follow the established folder structure strictly:

```text
src/
├── app/
│   ├── (staff)/             # Route group for staff portal pages (dashboard, students, fees, assessments, results)
│   ├── (student)/           # Route group for student portal pages (dashboard, assessments, marksheet)
│   ├── api/                 # Route handlers: role-scoped list/summary reads plus mutations per domain
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Public landing page
├── features/                # Client islands: enrol/edit forms, record-payment, grade-entry and submission modals
│   ├── students/
│   ├── fees/
│   ├── assessments/
│   └── results/
├── server/                  # Backend business logic & data access layer
│   ├── services/            # Business logic, cross-entity workflows, and pagination/KPI aggregation
│   ├── repositories/        # Database interaction and Prisma query wrappers
│   └── types/               # Per-domain payload and filter interfaces (mirrors src/types)
├── components/
│   ├── features/            # Server-rendered page sections, split by portal
│   │   ├── home/            # Landing page sections
│   │   ├── staff/           # dashboard, students, fees, assessments, results
│   │   └── student/         # dashboard, assessments, marksheet
│   ├── ui/                  # Generic, reusable UI primitives (buttons, inputs, dialogs, etc.)
│   └── shared/              # Shared composite components (navbar, sidebar, tables, status badges)
├── types/                   # Client-facing view-model types, one module per feature
└── lib/
    ├── prisma.ts            # Prisma client singleton (MUST import PrismaClient from '@/generated/prisma/client')
    ├── student-selection.ts # sms_selected_student cookie read/write helpers
    ├── utils.ts             # Generic helper utilities (cn, formatting)
    └── validations/         # Request and form validation schemas (Zod/TypeBox)
```

---

## Technical Rules & Best Practices

### 1. Prisma & Database
- **Prisma Client Location**: The Prisma client is generated into `src/generated/prisma`. Always import the singleton from `@/lib/prisma`.
- **Primary & Foreign Keys**: All entity IDs are `UUID` strings (`String @id @default(uuid())`). Do not use integer autoincrement IDs.
- **Prisma 7 Adapter**: Always ensure the PostgreSQL adapter `@prisma/adapter-pg` is utilized when instantiating `PrismaClient`.
- **Schema Changes**: When modifying `prisma/schema.prisma`, run `npx prisma generate` and `npx prisma migrate dev`.

### 2. Next.js & React 19 Standards
- **App Router**: Use Server Components by default. Add `'use client'` only when state, event handlers, or browser APIs are required.
- **Route Groups**: Place staff routes in `src/app/(staff)/` and student routes in `src/app/(student)/`. Do not expose internal roles in the URL path.
- **Server Actions & Route Handlers**: Validate all inputs using schemas from `src/lib/validations/` before querying or mutating data.
- **Layered Backend**: Route handlers (`src/app/api/...`) should delegate business logic to `src/server/services/` and database operations to `src/server/repositories/`.
- **Server-Rendered Ledgers**: Portal `page.tsx` files are Server Components that call their service directly and stream through `<Suspense>`. Search, filter and page state live in URL search params — never in client component state — so only the filter bar, pagination and modals remain client islands.
- **List vs. KPI Queries**: Each ledger pairs a list endpoint (`/api/<domain>/staff`) with an unfiltered summary endpoint (`/api/<domain>/staff/summary`) for the KPI cards; filters must never be applied to the summary. Push search and filter predicates into the Prisma `where` and paginate with `count` + `skip`/`take` — do not load every row and filter in memory.
- **Result Visibility**: There is no `src/server/policies/` layer and no authentication — the app simulates roles client-side via `RoleContext`. The staff/student data boundary is enforced where the query is built: student-facing repositories filter unpublished grades (`AssessmentResult.isPublished === false`) out of their results, as in `findStudentMarksheet()`. Keep new visibility rules in the repository that serves the role, not in the UI.

### 3. Code Quality & Verification
- **Preserve Existing Structures**: Do not delete existing directories or unrelated files when adding new features.
- **Type Safety**: Maintain strict TypeScript typing. Avoid `any`. Use models exported from `@/generated/prisma/client`.
- **Lint**: `npm run lint` must stay at zero errors. The only accepted warnings are the two intentional `react-hooks/exhaustive-deps` deviations in `RoleContext.tsx` and `SearchInput.tsx`; use a reasoned `eslint-disable` rather than restructuring an effect when the effect exists to avoid an SSR/hydration mismatch.
- **Verification**: Run `npm run build` after major structural or schema modifications to ensure zero TypeScript or build errors. All eight app routes must stay partial prerenders (`◐`); a route that reads `request.url` must await `connection()` first so it is never served from a prerendered snapshot.
