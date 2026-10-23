"use client";

import { useEffect, useState } from "react";
import type { InboxMessage, InboxStatus } from "../../_lib/api/inboxAdapter";
import { contactCategoryLabels } from "../../_lib/contact/contactTypes";
import { listInboxAction, setInboxStatusAction, type InboxPage } from "../../_lib/dashboard/inboxActions";
import { canReviewDrafts } from "../../_lib/session";
import { useRequireSession } from "../../_lib/useSession";
import { EmptyState } from "../../_ui/kit";
import DashboardPageHeader, { secondaryButton } from "../_ui/DashboardPageHeader";
import { gmailComposeUrl, OFFICE_MAILBOX } from "../../_lib/dashboard/gmailCompose";

const TABS: { key: InboxStatus | ""; label: string }[] = [
  { key: "new", label: "New" },
  { key: "handled", label: "Handled" },
  { key: "", label: "All" },
];
const categoryTone: Record<InboxMessage["category"], string> = {
  collaboration: "bg-[#253D9A]/10 text-[#253D9A]",
  data_request: "bg-[#C9972C]/15 text-[#7a5a14]",
  general: "bg-[#8b8fa3]/12 text-[#4f5878]",
};
const pagerClass =
  "rounded-md border border-[#dcdee8] px-4 py-1.5 text-[13px] font-semibold text-[#3a3f55] enabled:hover:border-[#253D9A] enabled:hover:text-[#253D9A] disabled:cursor-not-allowed disabled:opacity-50";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

function MessageRow({ m, me, onChange }: { m: InboxMessage; me?: number; onChange: (next: InboxMessage) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    const result = await setInboxStatusAction(m.id, m.status === "new" ? "handled" : "new").catch(() => ({ ok: false as const, error: "We couldn't reach the server. Please try again." }));
    setBusy(false);
    if (result.ok) onChange(result.message);
    else setError(result.error);
  }

  const subject = `Re: your message to PRI (${contactCategoryLabels[m.category]})`;
  return (
    <li className="px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${categoryTone[m.category]}`}>{contactCategoryLabels[m.category]}</span>
            {m.status === "new" && <span className="h-2 w-2 rounded-full bg-[#253D9A]" aria-label="New" />}
            <span className="text-[15px] font-semibold text-[#171a2b]">{m.name}</span>
          </p>
          <p className="mt-1 break-all text-[13px] text-[#5b6280]">
            <a href={gmailComposeUrl(m.email)} target="_blank" rel="noopener noreferrer" title={`Write from ${OFFICE_MAILBOX} in Gmail`} className="hover:text-[#253D9A] hover:underline">{m.email}</a> &middot; {when(m.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href={gmailComposeUrl(m.email, subject)} target="_blank" rel="noopener noreferrer" title={`Reply from ${OFFICE_MAILBOX} in Gmail`} className={secondaryButton}>Reply</a>
          <button type="button" onClick={toggle} disabled={busy} className={secondaryButton}>
            {busy ? "Saving…" : m.status === "new" ? "Mark handled" : "Reopen"}
          </button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-line break-words text-[14.5px] leading-relaxed text-[#2b2f45]">{m.message}</p>
      {m.status === "handled" && m.handledAt && (
        <p className="mt-2 text-[12px] text-[#8b8fa3]">Handled {when(m.handledAt)}{m.handledBy ? (m.handledBy === me ? " by you" : ` by user #${m.handledBy}`) : ""}</p>
      )}
      {error && <p role="alert" className="mt-2 text-[13px] text-[#B4432A]">{error}</p>}
    </li>
  );
}

export default function InboxPage() {
  const session = useRequireSession();
  const allowed = !!session && canReviewDrafts(session);
  const [tab, setTab] = useState<InboxStatus | "">("new");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<InboxPage | "loading">("loading");

  useEffect(() => {
    if (!allowed) return;
    let current = true;
    listInboxAction({ status: tab, page })
      .then((next) => current && setResult(next))
      .catch(() => current && setResult({ status: "error" }));
    return () => {
      current = false;
    };
  }, [allowed, tab, page]);

  function choose(next: InboxStatus | "") {
    setResult("loading");
    setPage(1);
    setTab(next);
  }

  function replace(next: InboxMessage) {
    setResult((r) => (r !== "loading" && r.status === "ok" ? { ...r, messages: r.messages.map((m) => (m.id === next.id ? next : m)) } : r));
  }

  if (!session) return null;
  const header = <DashboardPageHeader trail={["Inbox"]} title="Messages" description="What visitors send through the contact form. Each one is also emailed to PRI's contact address." />;

  if (!allowed) {
    return (
      <>
        {header}
        <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <p className="text-sm text-[#8b8fa3]">The inbox is limited to editors and admins.</p>
        </section>
      </>
    );
  }

  return (
    <>
      {header}
      <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <div role="tablist" aria-label="Filter messages" className="inline-flex gap-1 rounded-md border border-[#dcdee8] bg-white p-1">
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
            <p className="text-sm text-[#8b8fa3]">The server says this account may not read the inbox.</p>
          ) : result.status === "signed-out" ? (
            <p className="text-sm text-[#8b8fa3]">Your session has ended. <a href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in again</a>.</p>
          ) : result.status !== "ok" ? (
            <p className="text-sm text-[#B4432A]">We couldn&apos;t load the inbox just now. Please try again.</p>
          ) : result.messages.length === 0 ? (
            <EmptyState message={tab === "new" ? "No new messages. You're all caught up." : "No messages here yet."} />
          ) : (
            <>
              <ul className="divide-y divide-[#e6e8f0] rounded-lg border border-[#e3e6f0] bg-white">
                {result.messages.map((m) => (
                  <MessageRow key={m.id} m={m} me={session.id} onChange={replace} />
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between text-[13px] text-[#8b8fa3]">
                <span>{result.count} {result.count === 1 ? "message" : "messages"} &middot; page {page}</span>
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
