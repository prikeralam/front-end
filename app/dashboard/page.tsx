"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, roleLabels, type MockSession } from "../_lib/mockAuth";
import { PageHeader } from "../_ui/kit";
import DashboardTabs from "./_ui/DashboardTabs";
import { AdminOverview, EditorOverview, ResearcherOverview, FellowOverview, DonorOverview } from "./_ui/RoleOverview";

export default function DashboardV2() {
  const router = useRouter();
  const [session, setSessionState] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/v2/account");
      return;
    }
    setSessionState(s);
  }, [router, tick]);

  if (!session) return null;

  const bump = () => setTick((t) => t + 1);

  return (
    <>
      <PageHeader kicker="Your dashboard" title={`Welcome, ${session.name}`} intro={`Signed in as ${roleLabels[session.role]}`} />
      <DashboardTabs />

      <section className="mx-auto max-w-6xl px-6 py-16">
        {session.role === "admin" && <AdminOverview session={session} bump={bump} />}
        {session.role === "editor" && <EditorOverview session={session} bump={bump} />}
        {session.role === "researcher" && <ResearcherOverview session={session} bump={bump} />}
        {session.role === "fellow" && <FellowOverview session={session} bump={bump} />}
        {session.role === "public" && <DonorOverview session={session} bump={bump} />}
      </section>
    </>
  );
}
