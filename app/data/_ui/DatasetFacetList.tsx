"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { EmptyState } from "../../_ui/kit";

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

  const types = useMemo(() => distinct(datasets.map((d) => d.type)), [datasets]);
  const formats = useMemo(() => distinct(datasets.map((d) => d.fileFormat)), [datasets]);
  const geographies = useMemo(() => distinct(datasets.map((d) => d.geography)), [datasets]);
  const years = useMemo(() => distinct(datasets.map((d) => d.year)).sort().reverse(), [datasets]);

  const filtered = datasets.filter(
    (d) =>
      (!fileFormat || d.fileFormat === fileFormat) &&
      (!type || d.type === type) &&
      (!geography || d.geography === geography) &&
      (!year || d.year === year)
  );

  return (
    <div className={`grid gap-10 lg:grid-cols-[220px_1fr] ${className}`}>
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
          <div className="divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">{filtered.map(renderRow)}</div>
        )}
      </div>
    </div>
  );
}
