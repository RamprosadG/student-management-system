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
│   ├── api/                 # Route handlers: students, fees, payments, assessments, submissions, results
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Public landing page
├── features/                # Domain-specific client/server UI slices & state
│   ├── students/
│   ├── fees/
│   ├── assessments/
│   └── results/
├── server/                  # Backend business logic & data access layer
│   ├── services/            # Business logic and cross-entity workflows
│   ├── repositories/        # Database interaction and Prisma query wrappers
│   └── policies/            # Authorization rules and role-based access checks
├── components/
│   ├── ui/                  # Generic, reusable UI primitives (buttons, inputs, dialogs, etc.)
│   └── shared/              # Shared composite components (navbar, sidebar, tables, status badges)
└── lib/
    ├── prisma.ts            # Prisma client singleton (MUST import PrismaClient from '@/generated/prisma/client')
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

### 3. Code Quality & Verification
- **Preserve Existing Structures**: Do not delete existing directories or unrelated files when adding new features.
- **Type Safety**: Maintain strict TypeScript typing. Avoid `any`. Use models exported from `@/generated/prisma/client`.
- **Verification**: Run `npm run build` after major structural or schema modifications to ensure zero TypeScript or build errors.
