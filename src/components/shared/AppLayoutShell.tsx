"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { useRole } from "./RoleContext";
import Footer from "./Footer";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const { role } = useRole();

  return (
    <div
      className={`w-full min-h-screen flex relative bg-white${role === "student" ? " nav-stacked" : ""}`}
    >
      {/* 1. Left Sidebar (Fixed width w-64 on desktop) */}
      <Sidebar />

      {/* 2. Main content area taking all remaining width (pl-64 on desktop, no max-w restriction) */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
        {/* Fixed Top Header */}
        <Navbar />

        {/* Scrollable Main Viewport (offset by --sms-nav-height, the height of the fixed header) */}
        <main className="flex-1 flex flex-col pt-[var(--sms-nav-height)]">
          <div className="flex-1 p-6 md:p-8 w-full">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
