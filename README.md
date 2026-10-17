# Student Management System

A full-stack student management application built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## 1. How to Run Locally

### Prerequisites

- **Node.js**: v18.18.0+ or v20+ recommended
- **PostgreSQL**: Running locally or via a cloud instance
- **npm** (or yarn / pnpm)

### Steps

1. **Clone the repository and install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy the example environment file and update it with your database credentials:

   ```bash
   cp .env.example .env
   ```

   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

3. **Generate Prisma Client and apply migrations:**

   ```bash
   # Generate Prisma client artifacts
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open in browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 2. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma ORM and the `@prisma/adapter-pg` driver | `postgres://postgres:<password>@localhost:5432/student_management_system?sslmode=disable` |

> **Note:** Ensure your PostgreSQL server is running and the database specified in `DATABASE_URL` exists before executing migrations.

---

## 3. How AI Was Used During the Build

AI pair-programming was leveraged across the initial setup and scaffolding phases to accelerate development and ensure architecture consistency:

- **Architecture & Directory Scaffolding:** Automated the creation of a modular, layered structure (role-based route groups `(staff)` and `(student)`, domain-driven `features/`, service/repository pattern under `server/`, and shared components/utilities).
- **Prisma 7 & Adapter Integration:** Assisted in configuring Prisma 7 client generation alongside the `@prisma/adapter-pg` driver, handling required configuration flags and singleton client instantiation in `src/lib/prisma.ts`.
- **Validation & Build Verification:** Ran automated static analysis and Next.js Turbopack build checks to catch and resolve TypeScript and adapter configuration mismatches proactively.
