"use client";

import { useState } from "react";
import DashboardSidebar from "./_ui/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <DashboardSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="min-w-0 flex-1">
        <button
          onClick={() => setMobileOpen(true)}
          className="m-4 flex items-center gap-2 rounded-full border border-[#e6e8f0] bg-white px-4 py-2 text-[13px] font-semibold text-[#3a3f55] lg:hidden"
        >
          <span aria-hidden="true">☰</span> Menu
        </button>
        {children}
      </div>
    </div>
  );
}
