"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { EmptyState } from "../../_ui/kit";
import DatasetMeta from "./DatasetMeta";

const visibilityLabel: Record<string, string> = { public: "Public", "on-request": "On request", internal: "Internal only" };

const distinct = (values: (string | null | undefined)[]) => Array.from(new Set(values.filter((v): v is string => !!v)));

function FacetGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">{label}</p>
      <div className="space-y-1.5">
        <button
          onClick={() => onChange("")}
          className={`block text-[14px] ${!value ? "font-bold text-[#253D9A]" : "text-[#5b5f74] hover:text-[#253D9A]"}`}
        >
          All
        </button>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`block text-[14px] ${value === o ? "font-bold text-[#253D9A]" : "text-[#5b5f74] hover:text-[#253D9A]"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ThemeDatasetGrid({ datasets }: { datasets: DatasetSummary[] }) {
  const [type, setType] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [geography, setGeography] = useState("");
  const [year, setYear] = useState("");

  const types = useMemo(() => distinct(datasets.map((d) => d.type)), [datasets]);
  const formats = useMemo(() => distinct(datasets.map((d) => d.fileFormat)), [datasets]);
  const geographies = useMemo(() => distinct(datasets.map((d) => d.geography)), [datasets]);
  const years = useMemo(() => distinct(datasets.map((d) => d.year)).sort().reverse(), [datasets]);

  const filtered = datasets.filter(
    (d) =>
      (!type || d.type === type) &&
      (!fileFormat || d.fileFormat === fileFormat) &&
      (!geography || d.geography === geography) &&
      (!year || d.year === year)
  );

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
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
            {filtered.map((d) => (
              <Link
                key={d.slug}
                href={`/data/${d.slug}`}
                className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#fafbfc]"
              >
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#253D9A]/8 text-[#253D9A]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <ellipse cx="12" cy="5" rx="8" ry="3" />
                      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-[15px] font-bold leading-snug text-[#171a2b]">
                      {d.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 max-w-xl text-[13px] leading-relaxed text-[#5b5f74]">{d.description}</p>
                    <p className="mt-1.5 text-[12px] text-[#8b8fa3]">{[d.geography, d.year, d.theme].filter(Boolean).join(" · ")}</p>
                    <DatasetMeta lastUpdated={d.lastUpdated ?? "To be confirmed"} frequency={d.frequency ?? "To be confirmed"} />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-center">
                  {d.fileFormat && (
                    <span className="rounded bg-[#171a2b]/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#171a2b]">{d.fileFormat}</span>
                  )}
                  {d.type && <span className="rounded bg-[#253D9A]/8 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#253D9A]">{d.type}</span>}
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      d.visibility === "internal" ? "bg-[#8b8fa3]/10 text-[#5b5f74]" : "bg-[#E4633F]/10 text-[#E4633F]"
                    }`}
                  >
                    {d.visibility === "internal" && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
                      </svg>
                    )}
                    {visibilityLabel[d.visibility]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
