"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { datasets, dashboards } from "../../_content/datasets";
import {
  getSession,
  clearSession,
  getAccessRequests,
  requestAccess,
  decideAccessRequest,
  canAccessDataset,
  roleLabels,
  type MockSession,
} from "../../_lib/mockAuth";
import { PageHeader, SectionHeading, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function DashboardV1() {
  const router = useRouter();
  const [session, setSessionState] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/v1/account");
      return;
    }
    setSessionState(s);
  }, [router, tick]);

  if (!session) return null;

  const requests = getAccessRequests();
  const myPending = requests.filter((r) => r.requesterEmail === session.email && r.status === "pending");
  const myPendingSlugs = new Set(myPending.map((r) => r.datasetSlug));
  const fullAccess = datasets.filter((d) => canAccessDataset(d, session) === "full");
  const requestable = datasets.filter((d) => canAccessDataset(d, session) === "requestable" && !myPendingSlugs.has(d.slug));
  const toReview = ["editor", "admin"].includes(session.role) ? requests.filter((r) => r.status === "pending") : [];

  function handleSignOut() {
    clearSession();
    router.push("/v1");
  }

  return (
    <>
      <PageHeader kicker="Your dashboard" title={`Welcome, ${session.name}`} intro={`Signed in as ${roleLabels[session.role]}`} />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <button onClick={handleSignOut} className="border border-[#253D9A]/30 px-4 py-2 text-[13px] uppercase tracking-[0.12em] text-[#253D9A] hover:bg-[#253D9A] hover:text-white">
          Sign out
        </button>

        <div className="mt-12">
          <SectionHeading>Your datasets</SectionHeading>
          {fullAccess.length === 0 ? (
            <p className="mt-4 text-sm text-[#8b8fa3]">Nothing available yet — request access to a dataset below.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fullAccess.map((d) => (
                <div key={d.slug} className="border border-[#253D9A]/12 bg-white">
                  {d.preview && <MediaSlot need={d.preview} />}
                  <div className="p-5">
                    <h3 className="flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">
                      {d.title} <StatusTag status={d.status} />
                    </h3>
                    <p className="mt-2 text-[13px] text-[#8b8fa3]">{d.geography} &middot; {d.year}</p>
                    {d.files ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {d.files.map((f) => (
                          <a
                            key={f.path}
                            href={f.path}
                            download
                            className="bg-[#253D9A] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1B2C70]"
                          >
                            {f.label}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => alert("Mock download — no real file exists yet.")}
                        className="mt-4 bg-[#253D9A] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1B2C70]"
                      >
                        View &amp; download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {requestable.length > 0 && (
          <div className="mt-12">
            <SectionHeading>Request access</SectionHeading>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {requestable.map((d) => (
                <div key={d.slug} className="border border-[#253D9A]/12 bg-white p-5">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">{d.title}</h3>
                  <p className="mt-2 text-[13px] text-[#8b8fa3]">{d.geography} &middot; {d.year}</p>
                  <button
                    onClick={() => {
                      requestAccess(d.slug, session);
                      setTick((t) => t + 1);
                    }}
                    className="mt-4 border border-[#253D9A] px-4 py-2 text-[13px] font-medium text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                  >
                    Request access
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {myPending.length > 0 && (
          <div className="mt-12">
            <SectionHeading>Pending requests</SectionHeading>
            <ul className="mt-6 divide-y divide-[#253D9A]/10 border-y border-[#253D9A]/10">
              {myPending.map((r) => {
                const d = datasets.find((ds) => ds.slug === r.datasetSlug);
                return (
                  <li key={r.datasetSlug} className="flex items-center justify-between py-4">
                    <span className="text-[15px] text-[#171a2b]">{d?.title ?? r.datasetSlug}</span>
                    <span className="text-[12px] uppercase tracking-wide text-[#C9972C]">Pending review</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {toReview.length > 0 && (
          <div className="mt-12 border-t border-[#253D9A]/10 pt-10">
            <SectionHeading>Access requests to review</SectionHeading>
            <ul className="mt-6 divide-y divide-[#253D9A]/10 border-y border-[#253D9A]/10">
              {toReview.map((r) => {
                const d = datasets.find((ds) => ds.slug === r.datasetSlug);
                return (
                  <li key={`${r.datasetSlug}-${r.requesterEmail}`} className="flex items-center justify-between gap-4 py-4">
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
                        className="border border-[#253D9A] px-3 py-1.5 text-[12px] font-medium text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          decideAccessRequest(r.datasetSlug, r.requesterEmail, "denied");
                          setTick((t) => t + 1);
                        }}
                        className="border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-medium text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
                      >
                        Deny
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-12 border-t border-[#253D9A]/10 pt-10">
          <SectionHeading>Dashboards</SectionHeading>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {dashboards.map((d) => (
              <div key={d.slug} className="border border-[#253D9A]/12 bg-white p-5">
                {d.embed && <MediaSlot need={d.embed} />}
                <h3 className="mt-4 flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">
                  {d.title} <StatusTag status={d.status} />
                </h3>
                <p className="mt-2 text-sm text-[#5b5f74]">{d.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-12 text-[12px] text-[#8b8fa3]">
          Looking for a dataset? <Link href="/v1/data" className="underline hover:text-[#253D9A]">Browse the Data Repository &rarr;</Link>
        </p>
      </section>
    </>
  );
}
