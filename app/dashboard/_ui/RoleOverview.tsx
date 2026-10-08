"use client";

import { useState } from "react";
import Link from "next/link";
import { decideAccessRequestAction } from "../../_lib/dashboard/datasetActions";
import { useDatasets, usePendingAccessRequests, useMyAccessRequests } from "../../_lib/useDatasetsApi";
import type { AccessRequestRow } from "../../_lib/datasetTypes";
import type { Session } from "../../_lib/session";
import { transitionCmsAction } from "../../_lib/dashboard/cmsActions";
import { contentTypeLabel, type CmsRecord } from "../../_lib/cms/types";
import { useCmsRecords, useRecentAudit } from "../../_lib/useCmsApi";
import { SectionHeading, Card, EmptyState } from "../../_ui/kit";
import StatusBadge from "./StatusBadge";

type OverviewProps = { session: Session; bump: () => void };

// ---------------------------------------------------------------------------
// Shared building blocks reused across role views
// ---------------------------------------------------------------------------

const kpiTone = {
  amber: "before:bg-[#d98f1c]",
  coral: "before:bg-[#E4633F]",
  blue: "before:bg-[#253D9A]",
  green: "before:bg-[#27a567]",
};

/** A headline number with a coloured edge, linking to the screen where it can be acted on. */
function KpiTile({ value, label, tone, href }: { value: number; label: string; tone: keyof typeof kpiTone; href: string }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-xl border border-[#e3e6f0] bg-white p-5 shadow-[0_1px_2px_rgba(23,26,43,0.04)] transition-shadow before:absolute before:inset-y-0 before:left-0 before:w-1 hover:shadow-[0_4px_16px_rgba(23,26,43,0.08)] ${kpiTone[tone]}`}
    >
      <p className="font-[family-name:var(--font-mono)] text-[30px] font-semibold leading-none text-[#171a2b]">{value}</p>
      <p className="mt-2 text-[13px] text-[#5b6280] group-hover:text-[#253D9A]">{label} &rarr;</p>
    </Link>
  );
}

const panel = "rounded-xl border border-[#e3e6f0] bg-white shadow-[0_1px_2px_rgba(23,26,43,0.04)]";
const panelHeading = "flex items-center justify-between border-b border-[#edf0f6] px-5 py-3.5 font-[family-name:var(--font-heading)] text-[16px] text-[#171a2b]";

function BrowseDatasetsGrid({ session }: { session: Session | null }) {
  const datasets = useDatasets(session);
  const themes = Array.from(new Set(datasets.map((d) => d.theme).filter((t): t is string => !!t)));
  const themeCounts = themes.map((theme) => ({ theme, count: datasets.filter((d) => d.theme === theme).length }));

  return (
    <div>
      <SectionHeading>Browse datasets</SectionHeading>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {themeCounts.map((t) => (
          <Link
            key={t.theme}
            href={`/dashboard/theme/${encodeURIComponent(t.theme)}`}
            className="group rounded-xl border border-[#e6e8f0] bg-white p-7 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]"
          >
            <p className="text-4xl font-bold text-[#253D9A]">{t.count}</p>
            <p className="mt-2 text-lg font-bold text-[#171a2b] group-hover:text-[#253D9A]">{t.theme}</p>
            <p className="mt-1 text-[13px] text-[#8b8fa3]">{t.count === 1 ? "dataset" : "datasets"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MyPendingRequests({ session }: { session: Session }) {
  const datasets = useDatasets(session);
  const mine = useMyAccessRequests(session);
  const myPending = mine.filter((r) => r.status === "pending");
  if (myPending.length === 0) return null;

  return (
    <div>
      <SectionHeading>Your pending access requests</SectionHeading>
      <div className="mt-6 grid gap-3">
        {myPending.map((r) => {
          const d = datasets.find((ds) => ds.slug === r.datasetSlug);
          return (
            <div key={r.datasetSlug} className="flex items-center justify-between rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
              <span className="text-[15px] text-[#171a2b]">{d?.title ?? r.datasetSlug}</span>
              <span className="rounded-full bg-[#E4633F]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#E4633F]">Pending review</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccessRequestRowActions({ r, bump }: { r: AccessRequestRow; bump: () => void }) {
  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={async () => { await decideAccessRequestAction(r.id, "approved"); bump(); }}
        className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
      >
        Approve
      </button>
      <button
        onClick={async () => { await decideAccessRequestAction(r.id, "denied"); bump(); }}
        className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
      >
        Deny
      </button>
    </div>
  );
}

function AccessRequestsToReview({ session, bump }: { session: Session; bump: () => void }) {
  const datasets = useDatasets(session);
  const toReview = usePendingAccessRequests(session).filter((r) => r.status === "pending");
  if (toReview.length === 0) return null;

  return (
    <div>
      <SectionHeading>Access requests to review</SectionHeading>
      <div className="mt-6 grid gap-3">
        {toReview.map((r) => {
          const d = datasets.find((ds) => ds.slug === r.datasetSlug);
          return (
            <div key={r.id} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
              <div>
                <p className="text-[15px] text-[#171a2b]">{d?.title ?? r.datasetSlug}</p>
                <p className="mt-1 text-[13px] text-[#8b8fa3]">{[r.requesterName, r.requesterEmail].filter(Boolean).join(" · ")}</p>
              </div>
              <AccessRequestRowActions r={r} bump={bump} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Everything awaiting review across all content types, datasets included. Approve or send back; the backend checks the role. */
function ContentAwaitingReview({ session, bump }: { session: Session; bump: () => void }) {
  const toReview = useCmsRecords(session, [bump]).filter((r) => r.status === "in_review");
  const [error, setError] = useState<string | null>(null);
  if (toReview.length === 0) return null;

  async function decide(r: CmsRecord, next: "approved" | "draft") {
    const result = await transitionCmsAction(r.type, r.key, next).catch(() => null);
    setError(result && result.ok ? null : result ? result.message : "We couldn't reach the server. Please try again.");
    bump();
  }

  return (
    <div>
      <SectionHeading>Awaiting review</SectionHeading>
      {error && <p role="alert" className="mt-4 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] text-[#5b5f74]">{error}</p>}
      <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
        {toReview.map((r) => (
          <li key={`${r.type}-${r.key}`} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#171a2b]">{r.title}</p>
              <p className="mt-1 text-[12px] text-[#8b8fa3]">{contentTypeLabel[r.type]} &middot; created by user #{r.createdBy}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => decide(r, "approved")}
                className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
              >
                Approve
              </button>
              <button
                onClick={() => decide(r, "draft")}
                className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
              >
                Send back
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role overviews
// ---------------------------------------------------------------------------

export function AdminOverview({ session, bump }: OverviewProps) {
  const datasets = useDatasets(session);
  const pendingAccessRequests = usePendingAccessRequests(session).filter((r) => r.status === "pending");
  const cms = useCmsRecords(session, [bump]);
  const pendingDatasets = cms.filter((r) => r.type === "dataset" && r.status === "in_review");
  const pendingContent = cms.filter((r) => r.type !== "dataset" && r.status === "in_review");
  const recentActivity = useRecentAudit(session);
  const needsAttentionCount = pendingAccessRequests.length + pendingDatasets.length + pendingContent.length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile value={pendingAccessRequests.length} label="Pending access requests" tone="coral" href="#needs-attention" />
        <KpiTile value={pendingDatasets.length} label="Datasets awaiting review" tone="amber" href="/dashboard/manage" />
        <KpiTile value={pendingContent.length} label="Content awaiting review" tone="blue" href="/dashboard/content" />
        <KpiTile value={datasets.length} label="Datasets in the repository" tone="green" href="/dashboard/manage" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div id="needs-attention" className={`${panel} scroll-mt-6`}>
        <h2 className={panelHeading}>
          Needs your attention
          {needsAttentionCount > 0 && <span className="rounded-full bg-[#E4633F]/10 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[12px] text-[#b3452a]">{needsAttentionCount}</span>}
        </h2>
        {needsAttentionCount === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-[#7d86a8]">Nothing pending review right now.</p>
        ) : (
          <div className="divide-y divide-[#edf0f6] [&>div]:rounded-none [&>div]:border-0">
            {pendingAccessRequests.map((r) => {
              const d = datasets.find((ds) => ds.slug === r.datasetSlug);
              return (
                <div key={`ar-${r.id}`} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                  <div>
                    <p className="text-[15px] text-[#171a2b]">Access request &middot; {d?.title ?? r.datasetSlug}</p>
                    <p className="mt-1 text-[13px] text-[#8b8fa3]">{[r.requesterName, r.requesterEmail].filter(Boolean).join(" · ")}</p>
                  </div>
                  <AccessRequestRowActions r={r} bump={bump} />
                </div>
              );
            })}
            {pendingDatasets.map((d) => (
              <div key={`ds-${d.key}`} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[15px] text-[#171a2b]">Dataset &middot; {d.title}</p>
                  <p className="mt-1 text-[13px] text-[#8b8fa3]">created by user #{d.createdBy}</p>
                </div>
                <Link href="/dashboard/manage" className="shrink-0 rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white">
                  Review in Manage &rarr;
                </Link>
              </div>
            ))}
            {pendingContent.map((r) => (
              <div key={`content-${r.type}-${r.key}`} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[15px] text-[#171a2b]">{contentTypeLabel[r.type]} &middot; {r.title}</p>
                  <p className="mt-1 text-[13px] text-[#8b8fa3]">created by user #{r.createdBy}</p>
                </div>
                <button
                  onClick={async () => { await transitionCmsAction(r.type, r.key, "approved").catch(() => null); bump(); }}
                  className="shrink-0 rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={panel}>
        <h2 className={panelHeading}>
          Recent activity
          <Link href="/dashboard/audit" className="font-[family-name:var(--font-body)] text-[12.5px] font-semibold text-[#253D9A] hover:underline">Audit log &rarr;</Link>
        </h2>
        {recentActivity.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-[#7d86a8]">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#edf0f6]">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <p className="text-[13px] leading-snug text-[#171a2b]">{item.summary}</p>
                <span className="shrink-0 rounded bg-[#eef0f5] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[#5b6280]">{item.module}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>

      <div className="border-t border-[#e6e8f0] pt-10">
        <BrowseDatasetsGrid session={session} />
      </div>
    </div>
  );
}

export function EditorOverview({ session, bump }: OverviewProps) {
  return (
    <div className="space-y-12">
      <ContentAwaitingReview session={session} bump={bump} />
      <AccessRequestsToReview session={session} bump={bump} />
      <div className="border-t border-[#e6e8f0] pt-10">
        <BrowseDatasetsGrid session={session} />
      </div>
    </div>
  );
}

export function ResearcherOverview({ session }: OverviewProps) {
  const cms = useCmsRecords(session);
  // Contributors see published items and their own drafts; only the latter are "theirs".
  const mySubmissions = cms
    .filter((r) => session.id !== undefined && r.createdBy === session.id)
    .map((r) => ({ id: r.key, title: r.title, kind: contentTypeLabel[r.type], status: r.status, at: r.updatedAt }));

  return (
    <div className="space-y-12">
      <div>
        <SectionHeading>Your submissions</SectionHeading>
        {mySubmissions.length === 0 ? (
          <div className="mt-6"><EmptyState message="You haven't submitted anything yet. Get started below." /></div>
        ) : (
          <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
            {mySubmissions.map((s) => (
              <li key={`${s.kind}-${s.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-[15px] font-semibold text-[#171a2b]">{s.title}</p>
                  <p className="mt-1 text-[12px] text-[#8b8fa3]">{s.kind}</p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card href="/dashboard/manage">
          <p className="text-lg font-bold text-[#171a2b]">Submit a new dataset &rarr;</p>
          <p className="mt-2 text-[13px] text-[#8b8fa3]">Upload a dataset for Editor/Admin review.</p>
        </Card>
        <Card href="/dashboard/research">
          <p className="text-lg font-bold text-[#171a2b]">Submit a new publication &rarr;</p>
          <p className="mt-2 text-[13px] text-[#8b8fa3]">Draft a publication for Editor/Admin review.</p>
        </Card>
        <Card href="/dashboard/content">
          <p className="text-lg font-bold text-[#171a2b]">Draft content &rarr;</p>
          <p className="mt-2 text-[13px] text-[#8b8fa3]">Pages, testimonials, documents, team, projects.</p>
        </Card>
      </div>

      <div className="border-t border-[#e6e8f0] pt-10">
        <BrowseDatasetsGrid session={session} />
      </div>

      <div className="border-t border-[#e6e8f0] pt-10">
        <MyPendingRequests session={session} />
      </div>
    </div>
  );
}

export function FellowOverview({ session }: OverviewProps) {
  return (
    <div className="space-y-12">
      <p className="text-[13px] text-[#8b8fa3]">
        This reflects what&rsquo;s buildable today for the Intern/Fellow role. A fellow-specific application/assignment
        status view (Module D) is a future-phase feature not yet specified for the frontend.
      </p>

      <MyPendingRequests session={session} />

      <div className="border-t border-[#e6e8f0] pt-10">
        <BrowseDatasetsGrid session={session} />
      </div>
    </div>
  );
}

export function DonorOverview({ session }: OverviewProps) {
  return (
    <div className="space-y-12">
      <Card href="/donate">
        <p className="text-lg font-bold text-[#171a2b]">Support PRI&rsquo;s work &rarr;</p>
        <p className="mt-2 text-[13px] text-[#8b8fa3]">See how your contribution funds our research and outreach.</p>
      </Card>

      <MyPendingRequests session={session} />

      <div className="border-t border-[#e6e8f0] pt-10">
        <BrowseDatasetsGrid session={session} />
      </div>
    </div>
  );
}
