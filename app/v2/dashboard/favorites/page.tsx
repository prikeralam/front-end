"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { datasets } from "../../../_content/datasets";
import { getSession, getFavorites, toggleFavorite, canAccessDataset, logDownload, type MockSession } from "../../../_lib/mockAuth";
import { PageHeader, StatusTag, EmptyState } from "../../_ui/kit";
import DatasetMeta from "../../data/_ui/DatasetMeta";
import DashboardTabs from "../_ui/DashboardTabs";

export default function FavoritesV2() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/v2/account");
      return;
    }
    setSession(s);
  }, [router, tick]);

  if (!session) return null;

  const favoriteSlugs = getFavorites(session.email);
  const favorited = datasets.filter((d) => favoriteSlugs.includes(d.slug));

  return (
    <>
      <PageHeader kicker="Your dashboard" title="Favorites" intro="Datasets you've starred for quick access." />
      <DashboardTabs />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div>
          {favorited.length === 0 ? (
            <EmptyState message="No favorites yet — star a dataset from any theme's dataset list." />
          ) : (
            <div className="divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {favorited.map((d) => {
                const state = canAccessDataset(d, session);
                return (
                  <div key={d.slug} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <button
                        onClick={() => {
                          toggleFavorite(session.email, d.slug);
                          setTick((t) => t + 1);
                        }}
                        aria-label="Remove from favorites"
                        className="shrink-0 p-1 text-[#C9972C] hover:opacity-70"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6">
                          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6l-5.9 3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5Z" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="min-w-0">
                        <Link href={`/v2/data/${d.slug}`} className="flex items-center gap-2 text-[15px] font-bold leading-snug text-[#171a2b] hover:text-[#253D9A]">
                          {d.title}
                          <StatusTag status={d.status} />
                        </Link>
                        <p className="mt-1 line-clamp-2 max-w-xl text-[13px] leading-relaxed text-[#5b5f74]">{d.description}</p>
                        <p className="mt-1.5 text-[12px] text-[#8b8fa3]">{d.geography} &middot; {d.year} &middot; {d.theme}</p>
                        <DatasetMeta slug={d.slug} lastUpdated={d.lastUpdated} frequency={d.frequency} />
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-center">
                      {state === "full" && d.files ? (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {d.files.map((f) => (
                            <a
                              key={f.path}
                              href={f.path}
                              download
                              onClick={() => logDownload(d.slug, session)}
                              className="rounded-full bg-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1B2C70]"
                            >
                              {f.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <Link href={`/v2/data/${d.slug}`} className="text-[12px] font-semibold text-[#253D9A] hover:underline">View dataset &rarr;</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
