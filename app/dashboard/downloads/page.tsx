"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDatasets } from "../../_lib/useDatasetsApi";
import { getSession, getDownloadHistory, type MockSession } from "../../_lib/mockAuth";
import { PageHeader, EmptyState } from "../../_ui/kit";
import DashboardTabs from "../_ui/DashboardTabs";

export default function DownloadsV2() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/account");
      return;
    }
    setSession(s);
  }, [router]);

  const datasets = useDatasets(session ?? null);

  if (!session) return null;

  const history = getDownloadHistory(session.email);

  return (
    <>
      <PageHeader kicker="Your dashboard" title="Download history" intro="Every file you've downloaded through your account." />
      <DashboardTabs />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div>
          {history.length === 0 ? (
            <EmptyState message="No downloads yet." />
          ) : (
            <ul className="divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {history.map((r, i) => {
                const d = datasets.find((ds) => ds.slug === r.slug);
                return (
                  <li key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                    {d ? (
                      <Link href={`/dashboard/theme/${encodeURIComponent(d.theme ?? "")}/data/${d.slug}`} className="text-[15px] font-semibold text-[#171a2b] hover:text-[#253D9A]">
                        {d.title}
                      </Link>
                    ) : (
                      <span className="text-[15px] font-semibold text-[#171a2b]">{r.slug}</span>
                    )}
                    <span className="shrink-0 text-[12px] text-[#8b8fa3]">{new Date(r.at).toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
