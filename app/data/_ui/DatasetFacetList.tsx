"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { EmptyState } from "../../_ui/kit";

// A bordered chip on phones; a plain text row in the desktop sidebar.
const chip = "rounded-full border px-3 py-1.5 text-[13.5px] lg:block lg:rounded-none lg:border-0 lg:p-0 lg:text-left lg:text-[14px]";

const distinct = (values: (string | null | undefined)[]) => Array.from(new Set(values.filter((v): v is string => !!v)));

function FacetGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">{label}</p>
      <div className="flex flex-wrap gap-2 lg:block lg:space-y-1.5">
        {[{ label: "All", value: "" }, ...options.map((o) => ({ label: o, value: o }))].map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`${chip} ${value === o.value ? "border-[#253D9A] bg-[#253D9A]/8 font-bold text-[#253D9A] lg:bg-transparent" : "border-[#d9ddea] text-[#5b5f74] hover:text-[#253D9A]"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DatasetIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#253D9A]/8 text-[#253D9A]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      </svg>
    </div>
  );
}

/** Datasets with file format / type / geography / year facets derived from the data; each row is the caller's. */
export default function DatasetFacetList({
  datasets,
  renderRow,
  className = "",
}: {
  datasets: DatasetSummary[];
  renderRow: (dataset: DatasetSummary) => ReactNode;
  className?: string;
}) {
  const [fileFormat, setFileFormat] = useState("");
  const [type, setType] = useState("");
  const [geography, setGeography] = useState("");
  const [year, setYear] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const types = useMemo(() => distinct(datasets.map((d) => d.type)), [datasets]);
  const formats = useMemo(() => distinct(datasets.flatMap((d) => d.formats)), [datasets]);
  const geographies = useMemo(() => distinct(datasets.map((d) => d.geography)), [datasets]);
  const years = useMemo(() => distinct(datasets.map((d) => d.year)).sort().reverse(), [datasets]);

  const filtered = datasets.filter(
    (d) =>
      (!fileFormat || d.formats.includes(fileFormat)) &&
      (!type || d.type === type) &&
      (!geography || d.geography === geography) &&
      (!year || d.year === year)
  );

  const active = [fileFormat, type, geography, year].filter(Boolean).length;
  const clear = () => {
    setFileFormat("");
    setType("");
    setGeography("");
    setYear("");
  };

  return (
    <div className={`grid gap-4 lg:grid-cols-[220px_1fr] lg:gap-10 ${className}`}>
      {/* On phones the filters fold away behind one button so the datasets come first. */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="dataset-filters"
          className="inline-flex items-center gap-2 rounded-lg border border-[#d9ddea] bg-white px-3.5 py-2 text-[14px] font-semibold text-[#171a2b]"
        >
          Filters{active > 0 && <span className="rounded-full bg-[#253D9A] px-1.5 text-[11px] text-white">{active}</span>}
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}>
            <path d="m2.5 4.5 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-[13px] text-[#5b5f74]">
          {filtered.length} of {datasets.length} {datasets.length === 1 ? "dataset" : "datasets"}
          {active > 0 && (
            <button type="button" onClick={clear} className="ml-3 font-semibold text-[#253D9A] hover:underline">
              Clear
            </button>
          )}
        </p>
      </div>

      <aside id="dataset-filters" className={`${filtersOpen ? "" : "hidden"} space-y-6 rounded-lg border border-[#e6e8f0] bg-white p-4 lg:block lg:space-y-8 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:bg-transparent lg:p-0 lg:pr-8`}>
        <FacetGroup label="File format" options={formats} value={fileFormat} onChange={setFileFormat} />
        <FacetGroup label="Type" options={types} value={type} onChange={setType} />
        <FacetGroup label="Geography" options={geographies} value={geography} onChange={setGeography} />
        <FacetGroup label="Year" options={years} value={year} onChange={setYear} />
      </aside>

      <div>
        {filtered.length === 0 ? (
          <EmptyState message="No datasets match your filters." />
        ) : (
          <div className="divide-y divide-[#e6e8f0] rounded-lg border border-[#e6e8f0] bg-white">{filtered.map(renderRow)}</div>
        )}
      </div>
    </div>
  );
}
