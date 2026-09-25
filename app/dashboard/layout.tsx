"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkSession } from "../_lib/auth/authClient";
import DashboardSidebar from "./_ui/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Children read the session from local storage, so they only render once the server has confirmed it.
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    checkSession().then((check) => {
      if (check.status === "signed-out" || (check.status === "unreachable" && !check.session)) {
        router.replace("/account");
        return;
      }
      setVerified(true);
    });
  }, [router]);

  if (!verified) {
    return (
      <p role="status" className="p-8 text-[14px] text-[#8b8fa3]">
        Checking your session…
      </p>
    );
  }

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
