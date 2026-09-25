"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useDatasets, useMyAccessRequests } from "../../../_lib/useDatasetsApi";
import { requestAccessAction } from "../../../_lib/dashboard/datasetActions";
import { rememberRequestedDataset } from "../../../_lib/requestedAccess";
import { useRequireSession } from "../../../_lib/useSession";
import { PageHeader, EmptyState } from "../../../_ui/kit";
import DatasetMeta from "../../../data/_ui/DatasetMeta";

function FacetGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">{label}</p>
      <div className="space-y-1.5">
        <button onClick={() => onChange("")} className={`block text-[14px] ${!value ? "font-bold text-[#253D9A]" : "text-[#5b5f74] hover:text-[#253D9A]"}`}>
          All
        </button>
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`block text-[14px] ${value === o ? "font-bold text-[#253D9A]" : "text-[#5b5f74] hover:text-[#253D9A]"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardThemeV2({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: rawTheme } = use(params);
  const theme = decodeURIComponent(rawTheme);

  const session = useRequireSession();
  const [tick, setTick] = useState(0);
  const [fileFormat, setFileFormat] = useState("");
  const [type, setType] = useState("");
  const [geography, setGeography] = useState("");
  const [year, setYear] = useState("");

  const datasets = useDatasets(session, [tick]);
  const myRequests = useMyAccessRequests(session, [tick]);
  const themeDatasets = useMemo(() => datasets.filter((d) => d.theme === theme), [datasets, theme]);
  const distinct = (values: (string | null | undefined)[]) => Array.from(new Set(values.filter((v): v is string => !!v)));
  const types = useMemo(() => distinct(themeDatasets.map((d) => d.type)), [themeDatasets]);
  const formats = useMemo(() => distinct(themeDatasets.map((d) => d.fileFormat)), [themeDatasets]);
  const geographies = useMemo(() => distinct(themeDatasets.map((d) => d.geography)), [themeDatasets]);
  const years = useMemo(() => distinct(themeDatasets.map((d) => d.year)).sort().reverse(), [themeDatasets]);

  if (session === undefined) return null;
  if (!session) return null;
  const filtered = themeDatasets.filter(
    (d) =>
      (!fileFormat || d.fileFormat === fileFormat) &&
      (!type || d.type === type) &&
      (!geography || d.geography === geography) &&
      (!year || d.year === year)
  );

  return (
    <>
      <PageHeader kicker="Your dashboard" title={theme} intro={`${themeDatasets.length} ${themeDatasets.length === 1 ? "dataset" : "datasets"} in this theme.`} />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-8 lg:border-r lg:border-[#e6e8f0] lg:pr-8">
            <FacetGroup label="File format" options={formats} value={fileFormat} onChange={setFileFormat} />
            <FacetGroup label="Type" options={types} value={type} onChange={setType} />
            <FacetGroup label="Geography" options={geographies} value={geography} onChange={setGeography} />
            <FacetGroup label="Year" options={years} value={year} onChange={setYear} />
          </aside>

          <div>
            {filtered.length === 0 ? (
              <EmptyState message="No datasets match your filters." />
            ) : (
              <div className="divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
                {filtered.map((d) => {
                  const pending = myRequests.some((r) => r.datasetSlug === d.slug && r.status === "pending");
                  return (
                    <div key={d.slug} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#253D9A]/8 text-[#253D9A]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <ellipse cx="12" cy="5" rx="8" ry="3" />
                            <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                            <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
                          </svg>
                        </div>
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
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
