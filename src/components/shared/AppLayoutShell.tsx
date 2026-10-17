"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex relative bg-slate-50">
      {/* 1. Left Sidebar (Fixed width w-64 on desktop) */}
      <Sidebar />

      {/* 2. Main content area taking all remaining width (pl-64 on desktop, no max-w restriction) */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
        {/* Fixed Top Header */}
        <Navbar />

        {/* Scrollable Main Viewport (pt-16 offsets fixed h-16 header) */}
        <main className="flex-1 flex flex-col pt-16">
          <div className="flex-1 p-6 md:p-8 w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
