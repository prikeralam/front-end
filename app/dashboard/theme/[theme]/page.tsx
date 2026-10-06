"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useDatasets, useMyAccessRequests } from "../../../_lib/useDatasetsApi";
import { requestAccessAction } from "../../../_lib/dashboard/datasetActions";
import { rememberRequestedDataset } from "../../../_lib/requestedAccess";
import { useRequireSession } from "../../../_lib/useSession";
import DashboardPageHeader from "../../_ui/DashboardPageHeader";
import DatasetFacetList, { DatasetIcon } from "../../../data/_ui/DatasetFacetList";
import DatasetMeta from "../../../data/_ui/DatasetMeta";

export default function DashboardThemePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: rawTheme } = use(params);
  const theme = decodeURIComponent(rawTheme);

  const session = useRequireSession();
  const [tick, setTick] = useState(0);

  const datasets = useDatasets(session, [tick]);
  const myRequests = useMyAccessRequests(session, [tick]);
  const themeDatasets = useMemo(() => datasets.filter((d) => d.theme === theme), [datasets, theme]);

  if (session === undefined) return null;
  if (!session) return null;

  return (
    <>
      <DashboardPageHeader trail={["Data", "Themes"]} title={theme} description={`${themeDatasets.length} ${themeDatasets.length === 1 ? "dataset" : "datasets"} in this theme.`} />
      <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <DatasetFacetList
          datasets={themeDatasets}
          renderRow={(d) => {
            const pending = myRequests.some((r) => r.datasetSlug === d.slug && r.status === "pending");
            return (
              <div key={d.slug} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <DatasetIcon />
                  <div className="min-w-0">
                    <Link href={`/dashboard/theme/${encodeURIComponent(theme)}/data/${d.slug}`} className="flex items-center gap-2 text-[15px] font-bold leading-snug text-[#171a2b] hover:text-[#253D9A]">
                      {d.title}
                    </Link>
                    <p className="mt-1 line-clamp-2 max-w-xl text-[13px] leading-relaxed text-[#5b5f74]">{d.description}</p>
                    <p className="mt-1.5 text-[12px] text-[#8b8fa3]">{d.geography} &middot; {d.year}</p>
                    <DatasetMeta lastUpdated={d.lastUpdated ?? "To be confirmed"} frequency={d.frequency ?? "To be confirmed"} />
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-center">
                  {d.accessState === "full" && (
                    <Link
                      href={`/dashboard/theme/${encodeURIComponent(theme)}/data/${d.slug}`}
                      className="rounded-full bg-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1B2C70]"
                    >
                      Download
                    </Link>
                  )}
                  {d.accessState === "requestable" && !pending && (
                    <button
                      onClick={async () => {
                        const result = await requestAccessAction(d.slug).catch(() => "error" as const);
                        if (result === "requested" && session) rememberRequestedDataset(session.email, d.slug);
                        setTick((t) => t + 1);
                      }}
                      className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                    >
                      Request access
                    </button>
                  )}
                  {d.accessState === "requestable" && pending && (
                    <span className="rounded-full bg-[#E4633F]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#E4633F]">Pending</span>
                  )}
                  {d.accessState === "locked" && (
                    <span className="text-[12px] text-[#8b8fa3]">Restricted</span>
                  )}
                </div>
              </div>
            );
          }}
        />
      </section>
    </>
  );
}
