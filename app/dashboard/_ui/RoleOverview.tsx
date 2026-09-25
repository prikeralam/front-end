"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDashboardsAction } from "../../_lib/dashboard/datasetActions";
import type { DashboardCard } from "../../_lib/api/datasetAdapter";
import DashboardEmbed from "../../data/_ui/DashboardEmbed";
import { useDatasets, usePendingAccessRequests, useMyAccessRequests, decideAccessRequestApi, type AccessRequestRow } from "../../_lib/useDatasetsApi";
import {
  getDraftDatasets,
  decideDraftDataset,
  getRecentActivity,
  getFavorites,
  getDownloadHistory,
  getUserDirectory,
  type MockSession,
} from "../../_lib/mockAuth";
import {
  ALL_CONTENT_TYPES,
  contentTypeLabel,
  listRecords,
  transition,
  workflowStatusLabel,
  type ContentTypeKey,
  type WorkflowStatus,
} from "../../_lib/mockContentStore";
import { SectionHeading, Stat, Card, EmptyState } from "../../_ui/kit";

type OverviewProps = { session: MockSession; bump: () => void };

const statusLabel: Record<string, string> = { pending: "Pending review", rejected: "Rejected", ...workflowStatusLabel };
const statusColor: Record<string, string> = {
  pending: "bg-[#E4633F]/10 text-[#E4633F]",
  in_review: "bg-[#E4633F]/10 text-[#E4633F]",
  approved: "bg-[#253D9A]/10 text-[#253D9A]",
  published: "bg-[#253D9A]/10 text-[#253D9A]",
  rejected: "bg-[#8b8fa3]/10 text-[#5b5f74]",
  draft: "bg-[#8b8fa3]/10 text-[#5b5f74]",
  unpublished: "bg-[#8b8fa3]/10 text-[#5b5f74]",
};

function titleOf(data: Record<string, unknown>): string {
  return (data.title as string) ?? (data.name as string) ?? (data.quote as string) ?? String(data.slug ?? "");
}

// ---------------------------------------------------------------------------
// Shared building blocks reused across role views
// ---------------------------------------------------------------------------

function BrowseDatasetsGrid({ session }: { session: MockSession | null }) {
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

function DashboardsList() {
  const [dashboards, setDashboards] = useState<DashboardCard[]>([]);
  useEffect(() => {
    let current = true;
    listDashboardsAction()
      .then((list) => current && setDashboards(list))
      .catch(() => current && setDashboards([]));
    return () => {
      current = false;
    };
  }, []);

  return (
    <div>
      <SectionHeading>Dashboards</SectionHeading>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {dashboards.map((d) => (
          <div key={d.slug} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
            <DashboardEmbed url={d.embedUrl} title={d.title} type={d.embedType} />
            <h3 className="mt-4 text-lg font-bold text-[#171a2b]">{d.title}</h3>
            <p className="mt-2 text-sm text-[#5b5f74]">{d.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyPendingRequests({ session }: { session: MockSession }) {
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
        onClick={async () => { await decideAccessRequestApi(r.id, "approved"); bump(); }}
        className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
      >
        Approve
      </button>
      <button
        onClick={async () => { await decideAccessRequestApi(r.id, "denied"); bump(); }}
        className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
      >
        Deny
      </button>
    </div>
  );
}

function AccessRequestsToReview({ session, bump }: { session: MockSession; bump: () => void }) {
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

function DatasetsAwaitingReview({ bump }: { bump: () => void }) {
  const toReview = getDraftDatasets().filter((d) => d.status === "pending");
  if (toReview.length === 0) return null;

  return (
    <div>
      <SectionHeading>Datasets awaiting review</SectionHeading>
      <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
        {toReview.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
              <p className="mt-1 line-clamp-1 text-[13px] text-[#5b5f74]">{d.description}</p>
              <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.theme} &middot; {d.geography} &middot; {d.year} &middot; submitted by {d.submittedByName}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => { decideDraftDataset(d.id, "approved"); bump(); }}
                className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
              >
                Approve
              </button>
              <button
                onClick={() => { decideDraftDataset(d.id, "rejected"); bump(); }}
                className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Generalized across all Module A/B content types (content blocks, testimonials,
 * people, partners, documents, projects, publications) — replaces the old
 * type-specific "PublicationsAwaitingReview" block. */
function ContentAwaitingReview({ session, bump }: { session: MockSession; bump: () => void }) {
  const toReview = ALL_CONTENT_TYPES.flatMap((type) =>
    listRecords(type)
      .filter((r) => r.workflowStatus === "in_review")
      .map((r) => ({ type, ...r }))
  );
  if (toReview.length === 0) return null;

  function decide(type: ContentTypeKey, id: string, next: WorkflowStatus) {
    transition(type, id, next, session);
    bump();
  }

  return (
    <div>
      <SectionHeading>Content awaiting review</SectionHeading>
      <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
        {toReview.map((r) => (
          <li key={`${r.type}-${r.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#171a2b]">{titleOf(r.data as Record<string, unknown>)}</p>
              <p className="mt-1 text-[12px] text-[#8b8fa3]">{contentTypeLabel[r.type]} &middot; submitted by {r.submittedByName}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => decide(r.type, r.id, "approved")}
                className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
              >
                Approve
              </button>
              <button
                onClick={() => decide(r.type, r.id, "draft")}
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

function FavoritesDownloadsShortcuts({ session }: { session: MockSession }) {
  const favoriteCount = getFavorites(session.email).length;
  const downloadCount = getDownloadHistory(session.email).length;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Card href="/dashboard/favorites">
        <p className="text-3xl font-bold text-[#253D9A]">{favoriteCount}</p>
        <p className="mt-2 text-lg font-bold text-[#171a2b]">Saved datasets</p>
        <p className="mt-1 text-[13px] text-[#8b8fa3]">View your favorites &rarr;</p>
      </Card>
      <Card href="/dashboard/downloads">
        <p className="text-3xl font-bold text-[#253D9A]">{downloadCount}</p>
        <p className="mt-2 text-lg font-bold text-[#171a2b]">Downloads</p>
        <p className="mt-1 text-[13px] text-[#8b8fa3]">View your download history &rarr;</p>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role overviews
// ---------------------------------------------------------------------------

export function AdminOverview({ session, bump }: OverviewProps) {
  const datasets = useDatasets(session);
  const pendingAccessRequests = usePendingAccessRequests(session).filter((r) => r.status === "pending");
  const pendingDatasets = getDraftDatasets().filter((d) => d.status === "pending");
  const pendingContent = ALL_CONTENT_TYPES.flatMap((type) =>
    listRecords(type)
      .filter((r) => r.workflowStatus === "in_review")
      .map((r) => ({ type, ...r }))
  );
  const recentActivity = getRecentActivity();
  const needsAttentionCount = pendingAccessRequests.length + pendingDatasets.length + pendingContent.length;

  return (
    <div className="space-y-12">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value={String(pendingAccessRequests.length)} label="Pending access requests" />
        <Stat value={String(pendingDatasets.length)} label="Datasets awaiting review" />
        <Stat value={String(pendingContent.length)} label="Content items awaiting review" />
        <Stat value={String(datasets.length)} label="Total datasets in repository" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card href="/dashboard/users">
          <p className="text-lg font-bold text-[#171a2b]">Manage users &rarr;</p>
          <p className="mt-2 text-[13px] text-[#8b8fa3]">
            {getUserDirectory().length} account{getUserDirectory().length === 1 ? "" : "s"} on this browser &middot; grant or revoke roles.
          </p>
        </Card>
        <Card href="/dashboard/audit">
          <p className="text-lg font-bold text-[#171a2b]">Audit log &rarr;</p>
          <p className="mt-2 text-[13px] text-[#8b8fa3]">See every permission-relevant action across every module.</p>
        </Card>
      </div>

      <div>
        <SectionHeading>Needs your attention</SectionHeading>
        {needsAttentionCount === 0 ? (
          <div className="mt-6"><EmptyState message="Nothing pending review right now." /></div>
        ) : (
          <div className="mt-6 space-y-3">
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
              <div key={`ds-${d.id}`} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[15px] text-[#171a2b]">Dataset draft &middot; {d.title}</p>
                  <p className="mt-1 text-[13px] text-[#8b8fa3]">submitted by {d.submittedByName}</p>
                </div>
                <Link href="/dashboard/manage" className="shrink-0 rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white">
                  Review in Manage &rarr;
                </Link>
              </div>
            ))}
            {pendingContent.map((r) => (
              <div key={`content-${r.type}-${r.id}`} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[15px] text-[#171a2b]">{contentTypeLabel[r.type]} &middot; {titleOf(r.data as Record<string, unknown>)}</p>
                  <p className="mt-1 text-[13px] text-[#8b8fa3]">submitted by {r.submittedByName}</p>
                </div>
                <button
                  onClick={() => { transition(r.type, r.id, "approved", session); bump(); }}
                  className="shrink-0 rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeading>Recent activity</SectionHeading>
        {recentActivity.length === 0 ? (
          <div className="mt-6"><EmptyState message="No activity recorded yet in this browser." /></div>
        ) : (
          <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                <p className="text-[14px] text-[#171a2b]">{item.summary}</p>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[item.status] ?? "bg-[#8b8fa3]/10 text-[#5b5f74]"}`}>
                  {statusLabel[item.status] ?? item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[12px] text-[#8b8fa3]">A lightweight activity feed from this browser&rsquo;s mock data — not a real, cross-device audit log. See <Link href="/dashboard/audit" className="underline">the full audit log</Link>.</p>
      </div>

      <div className="border-t border-[#e6e8f0] pt-10 space-y-12">
        <BrowseDatasetsGrid session={session} />
        <DashboardsList />
      </div>
    </div>
  );
}

export function EditorOverview({ session, bump }: OverviewProps) {
  return (
    <div className="space-y-12">
      <DatasetsAwaitingReview bump={bump} />
      <ContentAwaitingReview session={session} bump={bump} />
      <AccessRequestsToReview session={session} bump={bump} />
      <div className="border-t border-[#e6e8f0] pt-10 space-y-12">
        <BrowseDatasetsGrid session={session} />
        <DashboardsList />
      </div>
    </div>
  );
}

export function ResearcherOverview({ session }: OverviewProps) {
  const myDatasets = getDraftDatasets().filter((d) => d.submittedByEmail === session.email);
  const myContent = ALL_CONTENT_TYPES.flatMap((type) =>
    listRecords(type)
      .filter((r) => r.submittedByEmail === session.email)
      .map((r) => ({ id: r.id, title: titleOf(r.data as Record<string, unknown>), kind: contentTypeLabel[type], status: r.workflowStatus, at: r.submittedAt }))
  );
  const mySubmissions = [
    ...myDatasets.map((d) => ({ id: d.id, title: d.title, kind: "Dataset", status: d.status, at: d.submittedAt })),
    ...myContent,
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="space-y-12">
      <div>
        <SectionHeading>Your submissions</SectionHeading>
        {mySubmissions.length === 0 ? (
          <div className="mt-6"><EmptyState message="You haven't submitted anything yet — get started below." /></div>
        ) : (
          <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
            {mySubmissions.map((s) => (
              <li key={`${s.kind}-${s.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-[15px] font-semibold text-[#171a2b]">{s.title}</p>
                  <p className="mt-1 text-[12px] text-[#8b8fa3]">{s.kind}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[s.status] ?? "bg-[#8b8fa3]/10 text-[#5b5f74]"}`}>{statusLabel[s.status] ?? s.status}</span>
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

      <div className="border-t border-[#e6e8f0] pt-10">
        <DashboardsList />
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

      <div>
        <SectionHeading>Your library</SectionHeading>
        <div className="mt-6">
          <FavoritesDownloadsShortcuts session={session} />
        </div>
      </div>

      <div className="border-t border-[#e6e8f0] pt-10 space-y-12">
        <BrowseDatasetsGrid session={session} />
        <DashboardsList />
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

      <div>
        <SectionHeading>Your library</SectionHeading>
        <div className="mt-6">
          <FavoritesDownloadsShortcuts session={session} />
        </div>
      </div>

      <div className="border-t border-[#e6e8f0] pt-10 space-y-12">
        <BrowseDatasetsGrid session={session} />
        <DashboardsList />
      </div>
    </div>
  );
}
