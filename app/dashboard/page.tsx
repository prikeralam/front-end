"use client";

import { useState } from "react";
import { roleLabels } from "../_lib/session";
import { useRequireSession } from "../_lib/useSession";
import DashboardPageHeader from "./_ui/DashboardPageHeader";
import AdminOverview from "./_ui/AdminOverview";
import { EditorOverview, ResearcherOverview, FellowOverview, DonorOverview } from "./_ui/RoleOverview";

export default function DashboardPage() {
  const session = useRequireSession();
  const [, setTick] = useState(0);

  if (!session) return null;

  const bump = () => setTick((t) => t + 1);

  return (
    <>
      <DashboardPageHeader trail={["Overview"]} title={`Welcome back, ${session.name}`} description={session.role === "admin" ? "How PRI's data is being used, and what is waiting for you." : `Signed in as ${roleLabels[session.role]}`} />

      <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        {session.role === "admin" && <AdminOverview session={session} bump={bump} />}
        {session.role === "editor" && <EditorOverview session={session} bump={bump} />}
        {session.role === "researcher" && <ResearcherOverview session={session} bump={bump} />}
        {session.role === "fellow" && <FellowOverview session={session} bump={bump} />}
        {session.role === "public" && <DonorOverview session={session} bump={bump} />}
      </section>
    </>
  );
}
