"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, isAdmin, getAccessRequests, getDraftDatasets, type MockSession } from "../../_lib/mockAuth";
import { ALL_CONTENT_TYPES, contentTypeLabel, listRecords, workflowStatusLabel, type WorkflowStatus } from "../../_lib/mockContentStore";
import { PageHeader, SectionHeading, EmptyState } from "../../_ui/kit";

type AuditRow = { at: string; module: string; actor: string; summary: string; status: string };

function titleOf(data: Record<string, unknown>): string {
  return (data.title as string) ?? (data.name as string) ?? (data.quote as string) ?? String(data.slug ?? "");
}

export default function AuditLog() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/account");
      return;
    }
    setSession(s);
  }, [router]);

  const rows: AuditRow[] = useMemo(() => {
    const items: AuditRow[] = [
      ...getAccessRequests().map((r) => ({
        at: r.requestedAt,
        module: "data-repository",
        actor: r.requesterEmail,
        summary: `${r.requesterName} requested access to ${r.datasetSlug}`,
        status: r.status,
      })),
      ...getDraftDatasets().map((d) => ({
        at: d.submittedAt,
        module: "data-repository",
        actor: d.submittedByEmail,
        summary: `${d.submittedByName} submitted dataset "${d.title}"`,
        status: d.status,
      })),
      ...ALL_CONTENT_TYPES.flatMap((type) =>
        listRecords(type).map((r) => ({
          at: r.submittedAt,
          module: type,
          actor: r.submittedByEmail,
          summary: `${r.submittedByName} submitted ${contentTypeLabel[type].toLowerCase()} "${titleOf(r.data as Record<string, unknown>)}"`,
          status: r.workflowStatus,
        }))
      ),
    ];
    return items.sort((a, b) => b.at.localeCompare(a.at));
  }, []);

  const modules = useMemo(() => Array.from(new Set(rows.map((r) => r.module))), [rows]);
  const actors = useMemo(() => Array.from(new Set(rows.map((r) => r.actor))), [rows]);
  const filtered = rows.filter((r) => (!moduleFilter || r.module === moduleFilter) && (!actorFilter || r.actor === actorFilter));

  if (!session) return null;

  if (!isAdmin(session)) {
    return (
      <>
        <PageHeader kicker="Module H" title="Audit log" />
        <section className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-sm text-[#8b8fa3]">The cross-module audit log is limited to the Admin role.</p>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        kicker="Module H"
        title="Audit log"
        intro="Every permission-relevant action recorded in this browser, across every module, in one place."
      />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e6e8f0] bg-[#fafbfc] p-4">
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#5b5f74]">
            Module
            <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="rounded-full border border-[#dcdee8] bg-white px-3 py-1.5 text-[13px]">
              <option value="">All</option>
              {modules.map((m) => <option key={m} value={m}>{m === "data-repository" ? "Data Repository" : contentTypeLabel[m as keyof typeof contentTypeLabel] ?? m}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#5b5f74]">
            Actor
            <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="rounded-full border border-[#dcdee8] bg-white px-3 py-1.5 text-[13px]">
              <option value="">All</option>
              {actors.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-8">
          <SectionHeading>Activity</SectionHeading>
          {filtered.length === 0 ? (
            <div className="mt-6"><EmptyState message="No activity matches these filters." /></div>
          ) : (
            <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {filtered.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-[14px] text-[#171a2b]">{r.summary}</p>
                    <p className="mt-1 text-[12px] text-[#8b8fa3]">{new Date(r.at).toLocaleString()}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#8b8fa3]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#5b5f74]">
                    {workflowStatusLabel[r.status as WorkflowStatus] ?? r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[12px] text-[#8b8fa3]">
            A client-side, single-browser activity feed — not Module H's real, server-side, cross-device audit log (a separate Django backend implements that; see the project&rsquo;s companion pri-backend repo).
          </p>
        </div>
      </section>
    </>
  );
}
