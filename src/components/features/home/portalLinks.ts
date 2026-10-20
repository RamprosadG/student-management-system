import type { PortalNavLink } from "@/types/home";

export const staffLinks: PortalNavLink[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Summary metrics, alerts, and overdue accounts",
    number: "01",
  },
  {
    href: "/students",
    title: "Student Enrolment",
    description: "Manage student records, search, filter, and enrol students",
    number: "02",
  },
  {
    href: "/fees",
    title: "Fees & Payments",
    description: "Track balances, assign fees, and record payments",
    number: "03",
  },
  {
    href: "/assessments",
    title: "Assessments & Submissions",
    description: "Create assessments and review submissions",
    number: "04",
  },
  {
    href: "/results",
    title: "Marksheet & Results",
    description: "Enter grades, review classifications, and publish marks",
    number: "05",
  },
];

export const studentLinks: PortalNavLink[] = [
  {
    href: "/student-dashboard",
    title: "Dashboard",
    description: "Academic overview, modules, and alerts",
    number: "01",
  },
  {
    href: "/student-assessments",
    title: "Assessments",
    description: "View deadlines, upload files, and resubmit work",
    number: "02",
  },
  {
    href: "/marksheet",
    title: "My Marksheet",
    description: "View published grades and classifications",
    number: "03",
  },
];
