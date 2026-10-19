import { PortalLink } from "@/components/shared/PortalLink";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Registry Management System
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Select a workflow below or use the sidebar navigation to get started.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Staff Operations Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Staff Operations
              </h2>
              <p className="text-xs text-zinc-500">
                Registry administrative workflows
              </p>
            </div>
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Staff Portal
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            <PortalLink
              href="/dashboard"
              portal="staff"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Dashboard
                </div>
                <div className="text-xs text-zinc-500">
                  Summary metrics, alerts, and overdue accounts
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>

            <PortalLink
              href="/students"
              portal="staff"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Student Enrolment
                </div>
                <div className="text-xs text-zinc-500">
                  Manage student directory, search, filter, and enrol students
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>

            <PortalLink
              href="/fees"
              portal="staff"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Fees & Payments
                </div>
                <div className="text-xs text-zinc-500">
                  Track balances, assign fees, and record payment transactions
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>

            <PortalLink
              href="/assessments"
              portal="staff"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Assessments & Submissions
                </div>
                <div className="text-xs text-zinc-500">
                  Create assessments and review submissions with late tracking
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>

            <PortalLink
              href="/results"
              portal="staff"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Marksheet & Results
                </div>
                <div className="text-xs text-zinc-500">
                  Enter grades, view classifications, and publish/withhold marks
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>
          </div>
        </div>

        {/* Student Access Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Student Portal
              </h2>
              <p className="text-xs text-zinc-500">
                Student self-service features
              </p>
            </div>
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Student Portal
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            <PortalLink
              href="/student-dashboard"
              portal="student"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Dashboard
                </div>
                <div className="text-xs text-zinc-500">
                  Academic overview, modules, and alerts
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>

            <PortalLink
              href="/student-assessments"
              portal="student"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Assessments
                </div>
                <div className="text-xs text-zinc-500">
                  View deadlines, upload files (PDF/DOCX), and resubmit work
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>

            <PortalLink
              href="/marksheet"
              portal="student"
              className="flex items-center justify-between rounded-lg p-3.5 text-sm hover:bg-zinc-50 border border-zinc-100 dark:border-zinc-800/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  My Marksheet
                </div>
                <div className="text-xs text-zinc-500">
                  View official published grades and classifications
                </div>
              </div>
              <span className="text-zinc-400 text-xs font-semibold">&rarr;</span>
            </PortalLink>
          </div>
        </div>
      </div>
    </div>
  );
}
