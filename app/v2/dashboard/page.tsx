"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { datasets, datasetThemes, dashboards } from "../../_content/datasets";
import {
  getSession,
  getAccessRequests,
  decideAccessRequest,
  roleLabels,
  type MockSession,
} from "../../_lib/mockAuth";
import { PageHeader, SectionHeading, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";
import DashboardTabs from "./_ui/DashboardTabs";

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

  const requests = getAccessRequests();
  const myPending = requests.filter((r) => r.requesterEmail === session.email && r.status === "pending");
  const toReview = ["editor", "admin"].includes(session.role) ? requests.filter((r) => r.status === "pending") : [];

  const themeCounts = datasetThemes
    .map((theme) => ({ theme, count: datasets.filter((d) => d.theme === theme).length }))
    .filter((t) => t.count > 0);

  return (
    <>
      <PageHeader kicker="Your dashboard" title={`Welcome, ${session.name}`} intro={`Signed in as ${roleLabels[session.role]}`} />
      <DashboardTabs />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div>
          <SectionHeading>Browse datasets</SectionHeading>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {themeCounts.map((t) => (
              <Link
                key={t.theme}
                href={`/v2/dashboard/theme/${encodeURIComponent(t.theme)}`}
                className="group rounded-xl border border-[#e6e8f0] bg-white p-7 transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]"
              >
                <p className="text-4xl font-bold text-[#253D9A]">{t.count}</p>
                <p className="mt-2 text-lg font-bold text-[#171a2b] group-hover:text-[#253D9A]">{t.theme}</p>
                <p className="mt-1 text-[13px] text-[#8b8fa3]">{t.count === 1 ? "dataset" : "datasets"}</p>
              </Link>
            ))}
          </div>
        </div>

        {myPending.length > 0 && (
          <div className="mt-12">
            <SectionHeading>Pending requests</SectionHeading>
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
        )}

        {toReview.length > 0 && (
          <div className="mt-12 border-t border-[#e6e8f0] pt-10">
            <SectionHeading>Access requests to review</SectionHeading>
            <div className="mt-6 grid gap-3">
              {toReview.map((r) => {
                const d = datasets.find((ds) => ds.slug === r.datasetSlug);
                return (
                  <div key={`${r.datasetSlug}-${r.requesterEmail}`} className="flex items-center justify-between gap-4 rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                    <div>
                      <p className="text-[15px] text-[#171a2b]">{d?.title ?? r.datasetSlug}</p>
                      <p className="mt-1 text-[13px] text-[#8b8fa3]">{r.requesterName} &middot; {r.requesterEmail}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => {
                          decideAccessRequest(r.datasetSlug, r.requesterEmail, "approved");
                          setTick((t) => t + 1);
                        }}
                        className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          decideAccessRequest(r.datasetSlug, r.requesterEmail, "denied");
                          setTick((t) => t + 1);
                        }}
                        className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-[#e6e8f0] pt-10">
          <SectionHeading>Dashboards</SectionHeading>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {dashboards.map((d) => (
              <div key={d.slug} className="rounded-xl border border-[#e6e8f0] bg-white p-5">
                {d.embed && <MediaSlot need={d.embed} />}
                <h3 className="mt-4 flex items-center gap-2 text-lg font-bold text-[#171a2b]">
                  {d.title} <StatusTag status={d.status} />
                </h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
