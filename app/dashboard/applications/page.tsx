"use client";

import { useEffect, useState } from "react";
import type { ApplicationRow, ApplicationStatus } from "../../_lib/api/applicationAdapter";
import { applicationKindLabels } from "../../_lib/apply/applyTypes";
import { getApplicationFileAction, listApplicationsAction, setApplicationStatusAction, type ApplicationsPage } from "../../_lib/dashboard/applicationActions";
import { canReviewDrafts } from "../../_lib/session";
import { useRequireSession } from "../../_lib/useSession";
import { EmptyState } from "../../_ui/kit";
import DashboardPageHeader, { secondaryButton } from "../_ui/DashboardPageHeader";

const TABS: { key: ApplicationStatus | ""; label: string }[] = [
  { key: "new", label: "New" },
  { key: "reviewed", label: "Reviewed" },
  { key: "", label: "All" },
];
const kindTone: Record<ApplicationRow["kind"], string> = {
  fellowship: "bg-[#253D9A]/10 text-[#253D9A]",
  internship: "bg-[#0F6B5C]/10 text-[#0F6B5C]",
  job: "bg-[#C9972C]/15 text-[#7a5a14]",
};
const pagerClass =
  "rounded-md border border-[#dcdee8] px-4 py-1.5 text-[13px] font-semibold text-[#3a3f55] enabled:hover:border-[#253D9A] enabled:hover:text-[#253D9A] disabled:cursor-not-allowed disabled:opacity-50";
const unreachable = "We couldn't reach the server. Please try again.";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

function ApplicationItem({ a, me, onChange }: { a: ApplicationRow; me?: number; onChange: (next: ApplicationRow) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    const result = await setApplicationStatusAction(a.id, a.status === "new" ? "reviewed" : "new").catch(() => ({ ok: false as const, error: unreachable }));
    setBusy(false);
    if (result.ok) onChange(result.application);
    else setError(result.error);
  }

  async function open(document: "cv" | "sop") {
    setError("");
    // Opened before the request so the browser doesn't treat it as an unrequested pop-up; the link expires, so it is
    // fetched on each click rather than kept on the page.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    const result = await getApplicationFileAction(a.id, document).catch(() => ({ ok: false as const, error: unreachable }));
    if (result.ok) {
      if (tab) tab.location.href = result.url;
      else window.location.assign(result.url);
    } else {
      tab?.close();
      setError(result.error);
    }
  }

  const applyingFor = a.kind === "job" ? a.jobTitle ?? "A job opening" : applicationKindLabels[a.kind];
  return (
    <li className="px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${kindTone[a.kind]}`}>{applyingFor}</span>
            {a.status === "new" && <span className="h-2 w-2 rounded-full bg-[#253D9A]" aria-label="New" />}
            <span className="text-[15px] font-semibold text-[#171a2b]">{a.fullName}</span>
          </p>
          <p className="mt-1 break-all text-[13px] text-[#5b6280]">
            <a href={`mailto:${a.email}`} className="hover:text-[#253D9A] hover:underline">{a.email}</a> &middot; {when(a.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={() => open("cv")} className={secondaryButton}>Open CV</button>
          <button type="button" onClick={() => open("sop")} className={secondaryButton}>Open SOP</button>
          <a href={`mailto:${a.email}?subject=${encodeURIComponent(`Your application to PRI (${applyingFor})`)}`} className={secondaryButton}>Reply</a>
          <button type="button" onClick={toggle} disabled={busy} className={secondaryButton}>
            {busy ? "Saving…" : a.status === "new" ? "Mark reviewed" : "Reopen"}
          </button>
        </div>
      </div>
      {a.status === "reviewed" && a.handledAt && (
        <p className="mt-2 text-[12px] text-[#8b8fa3]">Reviewed {when(a.handledAt)}{a.handledBy ? (a.handledBy === me ? " by you" : ` by user #${a.handledBy}`) : ""}</p>
      )}
      {error && <p role="alert" className="mt-2 text-[13px] text-[#B4432A]">{error}</p>}
    </li>
  );
}

export default function ApplicationsPage() {
  const session = useRequireSession();
  const allowed = !!session && canReviewDrafts(session);
  const [tab, setTab] = useState<ApplicationStatus | "">("new");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ApplicationsPage | "loading">("loading");

  useEffect(() => {
    if (!allowed) return;
    let current = true;
    listApplicationsAction({ status: tab, page })
      .then((next) => current && setResult(next))
      .catch(() => current && setResult({ status: "error" }));
    return () => {
      current = false;
    };
  }, [allowed, tab, page]);

  function choose(next: ApplicationStatus | "") {
    setResult("loading");
    setPage(1);
    setTab(next);
  }

  function replace(next: ApplicationRow) {
    setResult((r) => (r !== "loading" && r.status === "ok" ? { ...r, applications: r.applications.map((a) => (a.id === next.id ? next : a)) } : r));
  }

  if (!session) return null;
  const header = (
    <DashboardPageHeader
      trail={["Inbox", "Applications"]}
      title="Applications"
      description="Fellowship, internship and job applications sent through the website. PRI's contact address is told about each one; the CV and SOP open only from here."
    />
  );

  if (!allowed) {
    return (
      <>
        {header}
        <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <p className="text-sm text-[#8b8fa3]">Applications are limited to editors and admins.</p>
        </section>
      </>
    );
  }

  return (
    <>
      {header}
      <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <div role="tablist" aria-label="Filter applications" className="inline-flex gap-1 rounded-md border border-[#dcdee8] bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.label}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => choose(t.key)}
              className={`rounded-[5px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${tab === t.key ? "bg-[#253D9A] text-white" : "text-[#4b4f66] hover:bg-[#f3f5fa]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {result === "loading" ? (
            <p role="status" className="text-sm text-[#8b8fa3]">Loading…</p>
          ) : result.status === "forbidden" ? (
            <p className="text-sm text-[#8b8fa3]">The server says this account may not read applications.</p>
          ) : result.status === "signed-out" ? (
            <p className="text-sm text-[#8b8fa3]">Your session has ended. <a href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in again</a>.</p>
          ) : result.status !== "ok" ? (
            <p className="text-sm text-[#B4432A]">We couldn&apos;t load the applications just now. Please try again.</p>
          ) : result.applications.length === 0 ? (
            <EmptyState message={tab === "new" ? "No new applications." : "No applications here yet."} />
          ) : (
            <>
              <ul className="divide-y divide-[#e6e8f0] rounded-lg border border-[#e3e6f0] bg-white">
                {result.applications.map((a) => (
                  <ApplicationItem key={a.id} a={a} me={session.id} onChange={replace} />
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between text-[13px] text-[#8b8fa3]">
                <span>{result.count} {result.count === 1 ? "application" : "applications"} &middot; page {page}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setResult("loading"); setPage((p) => p - 1); }} disabled={!result.hasPrevious} className={pagerClass}>Previous</button>
                  <button onClick={() => { setResult("loading"); setPage((p) => p + 1); }} disabled={!result.hasNext} className={pagerClass}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
