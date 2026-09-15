"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  getUserDirectory,
  setUserRole,
  isAdmin,
  roles,
  roleLabels,
  type MockSession,
  type Role,
} from "../../_lib/mockAuth";
import { PageHeader, SectionHeading, EmptyState } from "../../_ui/kit";
import DashboardTabs from "../_ui/DashboardTabs";

export default function ManageUsersV2() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);
  const [changed, setChanged] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/account");
      return;
    }
    setSession(s);
  }, [router, tick]);

  if (!session) return null;

  if (!isAdmin(session)) {
    return (
      <>
        <PageHeader kicker="Your dashboard" title="Manage users" />
        <DashboardTabs />
        <section className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-sm text-[#8b8fa3]">Granting or revoking roles is limited to the Admin role. Sign in as Admin to preview this page.</p>
        </section>
      </>
    );
  }

  const directory = getUserDirectory();
  const myEmail = session.email;

  function handleRoleChange(email: string, role: Role) {
    setUserRole(email, role);
    if (email === myEmail) {
      // Changing your own role changes the live session — reload so the
      // header, tabs, and this page's own access check all pick it up
      // consistently, instead of some showing the old role until the next
      // navigation.
      window.location.reload();
      return;
    }
    setChanged(email);
    setTick((t) => t + 1);
    setTimeout(() => setChanged(null), 2000);
  }

  return (
    <>
      <PageHeader
        kicker="Your dashboard"
        title="Manage users"
        intro="Grant or revoke a role for any account that has signed in on this browser (Module H)."
      />
      <DashboardTabs />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <SectionHeading>User directory</SectionHeading>

        {directory.length === 0 ? (
          <div className="mt-6">
            <EmptyState message="No accounts recorded yet in this browser." />
          </div>
        ) : (
          <div className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
            {directory.map((u) => (
              <div key={u.email} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">
                    {u.name}
                    {u.email === session.email && (
                      <span className="rounded-full bg-[#253D9A]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#253D9A]">You</span>
                    )}
                  </p>
                  <p className="mt-1 text-[13px] text-[#8b8fa3]">{u.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {changed === u.email && <span className="text-[12px] font-semibold text-[#253D9A]">Updated</span>}
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.email, e.target.value as Role)}
                    className="h-10 rounded-lg border border-[#dcdee8] bg-white px-3 text-[14px] text-[#171a2b]"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-[12px] text-[#8b8fa3]">
          Mock directory — this browser&rsquo;s localStorage only, not a real cross-device user table. A role change
          applies to that account&rsquo;s directory record immediately, and to the live session in this browser if
          it&rsquo;s the one being changed.
        </p>
      </section>
    </>
  );
}
