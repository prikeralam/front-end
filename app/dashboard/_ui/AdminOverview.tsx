"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { transitionCmsAction } from "../../_lib/dashboard/cmsActions";
import { decideAccessRequestAction } from "../../_lib/dashboard/datasetActions";
import { getVisitorStatsAction, type VisitorStats } from "../../_lib/dashboard/userActions";
import { contentTypeLabel } from "../../_lib/cms/types";
import type { Session } from "../../_lib/session";
import { useCmsRecords, useRecentAudit } from "../../_lib/useCmsApi";
import { useDatasets, usePendingAccessRequests } from "../../_lib/useDatasetsApi";
import { BarList, WeeklyBars } from "./charts";
import { Badge, Panel, StatCard, buttonClass, mono, primaryClass } from "./console";

/**
 * The admin's first screen: who is signing up and downloading (backend `/users/stats/`), what is waiting for a
 * decision, and what changed recently.
 */
export default function AdminOverview({ session, bump }: { session: Session; bump: () => void }) {
  const [stats, setStats] = useState<VisitorStats | null | "loading">("loading");
  const datasets = useDatasets(session);
  const pendingAccess = usePendingAccessRequests(session).filter((r) => r.status === "pending");
  const cms = useCmsRecords(session, [bump]);
  const pendingDatasets = cms.filter((r) => r.type === "dataset" && r.status === "in_review");
  const pendingContent = cms.filter((r) => r.type !== "dataset" && r.status === "in_review");
  const activity = useRecentAudit(session);
  const waiting = pendingAccess.length + pendingDatasets.length + pendingContent.length;

  useEffect(() => {
    let current = true;
    getVisitorStatsAction()
      .catch(() => null)
      .then((s) => {
        if (current) setStats(s);
      });
    return () => {
      current = false;
    };
  }, []);

  const s = stats === "loading" ? null : stats;
  const weekly = s?.weeklySignups ?? [];
  const thisWeek = weekly.at(-1)?.count ?? 0;
  const lastWeek = weekly.at(-2)?.count ?? 0;
  const dash = stats === "loading" ? "…" : "–";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="New visitors this week"
          value={s ? thisWeek : dash}
          note={s ? (thisWeek === lastWeek ? "Same as last week" : `${thisWeek > lastWeek ? "▲" : "▼"} ${Math.abs(thisWeek - lastWeek)} on last week`) : " "}
          trend={weekly.map((w) => w.count)}
          href="/dashboard/visitors"
        />
        <StatCard label="Visitors" value={s ? s.visitors.total : dash} note={s ? `${s.visitors.confirmed} confirmed · ${s.visitors.newsletter} newsletter` : " "} href="/dashboard/visitors" />
        <StatCard label="Downloads, 30 days" value={s ? s.downloads.last30Days : dash} note={s ? `${s.downloads.total} since records began` : " "} />
        <StatCard label="Awaiting a decision" value={waiting} note={`${datasets.length} datasets in the repository`} href="#needs-attention" />
      </div>

      {stats === null && <p role="alert" className="text-[13px] text-danger">Visitor and download figures couldn&apos;t be loaded. Refresh to try again.</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Sign-ups per week" description="Visitor accounts created, last 12 weeks">
          {s ? <WeeklyBars weeks={weekly} unit="sign-ups" /> : <div className="h-44 animate-pulse rounded-lg bg-canvas motion-reduce:animate-none" />}
        </Panel>
        <Panel title="What visitors use the data for">
          <BarList items={(s?.purposes ?? []).map((p) => ({ key: p.purpose || "none", label: p.label, value: p.count }))} empty="No sign-ups yet." />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Most downloaded datasets" description="All time" actions={<Link href="/dashboard/manage" className="text-[12.5px] font-semibold text-brand hover:underline">Datasets →</Link>}>
          <BarList
            items={(s?.downloads.topDatasets ?? []).map((d) => ({ key: d.slug, label: <Link href={`/data/${d.slug}`} target="_blank" className="hover:text-brand hover:underline">{d.title}</Link>, value: d.count }))}
            empty="No downloads recorded yet."
          />
        </Panel>
        <Panel title="Top organisations" description="Where signed-up visitors work or study">
          <BarList items={(s?.topOrganisations ?? []).map((o) => ({ key: o.organisation, label: o.organisation, value: o.count }))} empty="No organisations given yet." />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div id="needs-attention" className="scroll-mt-20">
          <Panel title="Needs your attention" actions={waiting > 0 ? <Badge tone="warn" dot={false}>{waiting}</Badge> : undefined} flush>
            {waiting === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-muted">Nothing is waiting for a decision.</p>
            ) : (
              <ul className="divide-y divide-line">
                {pendingAccess.map((r) => {
                  const d = datasets.find((ds) => ds.slug === r.datasetSlug);
                  return (
                    <li key={`ar-${r.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-[13.5px] text-ink"><Badge dot={false}>Access</Badge> <span className="ml-1">{d?.title ?? r.datasetSlug}</span></p>
                        <p className="mt-0.5 text-[12.5px] text-muted">{[r.requesterName, r.requesterEmail].filter(Boolean).join(" · ")}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={async () => { await decideAccessRequestAction(r.id, "approved").catch(() => false); bump(); }} className={primaryClass}>Approve</button>
                        <button type="button" onClick={async () => { await decideAccessRequestAction(r.id, "denied").catch(() => false); bump(); }} className={buttonClass}>Deny</button>
                      </div>
                    </li>
                  );
                })}
                {pendingDatasets.map((d) => (
                  <li key={`ds-${d.key}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <p className="min-w-0 text-[13.5px] text-ink"><Badge dot={false}>Dataset</Badge> <span className="ml-1">{d.title}</span></p>
                    <Link href="/dashboard/manage" className={buttonClass}>Review →</Link>
                  </li>
                ))}
                {pendingContent.map((r) => (
                  <li key={`c-${r.type}-${r.key}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <p className="min-w-0 text-[13.5px] text-ink"><Badge dot={false}>{contentTypeLabel[r.type]}</Badge> <span className="ml-1">{r.title}</span></p>
                    <button type="button" onClick={async () => { await transitionCmsAction(r.type, r.key, "approved").catch(() => null); bump(); }} className={primaryClass}>Approve</button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <Panel title="Recent activity" actions={<Link href="/dashboard/audit" className="text-[12.5px] font-semibold text-brand hover:underline">Audit log →</Link>} flush>
          {activity.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <p className="text-[13px] leading-snug text-ink-soft">{item.summary}</p>
                  <span className={`${mono} shrink-0 rounded bg-canvas px-1.5 py-0.5 text-[10.5px] text-muted`}>{item.module}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
