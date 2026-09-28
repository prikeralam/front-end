"use client";

import { useEffect, useState, type FormEvent } from "react";
import { isAdmin } from "../../_lib/session";
import { useRequireSession } from "../../_lib/useSession";
import { listAuditLogAction, type AuditPage } from "../../_lib/dashboard/auditActions";
import { PageHeader, SectionHeading, EmptyState } from "../../_ui/kit";

const inputClass = "rounded-full border border-[#dcdee8] bg-white px-3 py-1.5 text-[13px] text-[#171a2b]";
const pagerClass =
  "rounded-full border border-[#dcdee8] px-4 py-1.5 text-[13px] font-semibold text-[#3a3f55] enabled:hover:border-[#253D9A] enabled:hover:text-[#253D9A] disabled:cursor-not-allowed disabled:opacity-50";

export default function AuditLog() {
  const session = useRequireSession();
  const [moduleInput, setModuleInput] = useState("");
  const [actorInput, setActorInput] = useState("");
  const [applied, setApplied] = useState({ module: "", actor: "" });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AuditPage | "loading">("loading");

  const admin = !!session && isAdmin(session);

  useEffect(() => {
    if (!admin) return;
    let current = true;
    listAuditLogAction({ module: applied.module || undefined, actor: applied.actor || undefined, page })
      .then((next) => current && setResult(next))
      .catch(() => current && setResult({ status: "error" }));
    return () => {
      current = false;
    };
  }, [admin, applied, page]);

  function applyFilters(e: FormEvent) {
    e.preventDefault();
    setResult("loading");
    setPage(1);
    setApplied({ module: moduleInput.trim(), actor: actorInput.trim() });
  }

  if (!session) return null;

  if (!admin) {
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
      <PageHeader kicker="Module H" title="Audit log" intro="Every permission-relevant action recorded by the platform, across every module." />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e6e8f0] bg-[#fafbfc] p-4">
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#5b5f74]">
            Module
            <input list="audit-modules" value={moduleInput} onChange={(e) => setModuleInput(e.target.value)} placeholder="e.g. accounts" className={inputClass} />
            <datalist id="audit-modules">
              {["accounts", "datarepo", "content", "testimonial", "publication", "project"].map((m) => <option key={m} value={m} />)}
            </datalist>
          </label>
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#5b5f74]">
            Actor (user id)
            <input value={actorInput} onChange={(e) => setActorInput(e.target.value)} inputMode="numeric" pattern="\d*" placeholder="e.g. 12" className={`${inputClass} w-24`} />
          </label>
          <button type="submit" className="rounded-full bg-[#253D9A] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1B2C70]">Apply</button>
        </form>

        <div className="mt-8">
          <SectionHeading>Activity</SectionHeading>
          {result === "loading" ? (
            <p role="status" className="mt-6 text-sm text-[#8b8fa3]">Loading…</p>
          ) : result.status === "forbidden" ? (
            <p className="mt-6 text-sm text-[#8b8fa3]">The server says this account may not view the audit log.</p>
          ) : result.status === "signed-out" ? (
            <p className="mt-6 text-sm text-[#8b8fa3]">Your session has ended. <a href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in again</a>.</p>
          ) : result.status === "invalid" ? (
            <p className="mt-6 text-sm text-[#E4633F]">Those filters aren&apos;t valid. Use a module name and a numeric user id.</p>
          ) : result.status === "error" ? (
            <p className="mt-6 text-sm text-[#E4633F]">We couldn&apos;t load the audit log just now. Please try again.</p>
          ) : result.rows.length === 0 ? (
            <div className="mt-6"><EmptyState message="No activity matches these filters." /></div>
          ) : (
            <>
              <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
                {result.rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-[14px] text-[#171a2b]">{r.summary}</p>
                      <p className="mt-1 text-[12px] text-[#8b8fa3]">{r.actor} &middot; {new Date(r.at).toLocaleString()}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#8b8fa3]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#5b5f74]">{r.module}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between text-[13px] text-[#8b8fa3]">
                <span>{result.count} {result.count === 1 ? "entry" : "entries"} &middot; page {page}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setResult("loading"); setPage((p) => p - 1); }} disabled={!result.hasPrevious} className={pagerClass}>Previous</button>
                  <button onClick={() => { setResult("loading"); setPage((p) => p + 1); }} disabled={!result.hasNext} className={pagerClass}>Next</button>
                </div>
              </div>
            </>
          )}
          <p className="mt-3 text-[12px] text-[#8b8fa3]">The API records the actor as a user id only; names and emails are not exposed to this screen.</p>
        </div>
      </section>
    </>
  );
}
