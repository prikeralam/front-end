"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkSession } from "../_lib/auth/authClient";
import type { Session } from "../_lib/session";
import ChangePasswordForm from "./_ui/ChangePasswordForm";
import DashboardSidebar from "./_ui/DashboardSidebar";
import ConsoleTopBar from "./_ui/ConsoleTopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Children read the session from local storage, so they only render once the server has confirmed it.
  const [verified, setVerified] = useState<Session | null>(null);

  const verify = useCallback(() => {
    checkSession().then((check) => {
      if (check.status === "signed-out" || (check.status === "unreachable" && !check.session)) {
        router.replace("/account");
        return;
      }
      // Visitors who signed up to download data have an account page, not the staff dashboard.
      if (check.session?.role === "public") {
        router.replace("/account");
        return;
      }
      setVerified(check.session);
    });
  }, [router]);

  useEffect(verify, [verify]);

  if (!verified) {
    return (
      <p role="status" className="p-8 text-[14px] text-[#8b8fa3]">
        Checking your session…
      </p>
    );
  }

  // A temporary password set by an admin has to be replaced before anything else.
  if (verified.mustChangePassword) return <ChangePasswordForm name={verified.name} onChanged={verify} />;

  return (
    <div className="flex min-h-screen bg-canvas">
      <DashboardSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="min-w-0 flex-1">
        <ConsoleTopBar onMenu={() => setMobileOpen(true)} />
        {children}
      </div>
    </div>
  );
}
