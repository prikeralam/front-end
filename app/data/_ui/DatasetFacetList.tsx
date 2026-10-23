"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { EmptyState } from "../../_ui/kit";

const distinct = (values: (string | null | undefined)[]) => Array.from(new Set(values.filter((v): v is string => !!v)));

function FacetSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  if (options.length === 0) return null;
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.12em] text-[#8b8fa3]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full min-w-0 rounded-lg border bg-white px-3 text-[14px] outline-none focus:border-[#253D9A] focus:ring-4 focus:ring-[#253D9A]/12 sm:w-44 ${value ? "border-[#253D9A] font-semibold text-[#253D9A]" : "border-[#d9ddea] text-[#171a2b]"}`}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
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

/** Datasets with sub-theme / file format / type / geography / year facets derived from the data; each row is the caller's. */
export default function DatasetFacetList({
  datasets,
  renderRow,
  className = "",
}: {
  datasets: DatasetSummary[];
  renderRow: (dataset: DatasetSummary) => ReactNode;
  className?: string;
}) {
  const [subTheme, setSubTheme] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [type, setType] = useState("");
  const [geography, setGeography] = useState("");
  const [year, setYear] = useState("");

  const subThemes = useMemo(() => distinct(datasets.map((d) => d.subTheme)).sort(), [datasets]);
  const types = useMemo(() => distinct(datasets.map((d) => d.type)), [datasets]);
  const formats = useMemo(() => distinct(datasets.flatMap((d) => d.formats)), [datasets]);
  const geographies = useMemo(() => distinct(datasets.map((d) => d.geography)), [datasets]);
  const years = useMemo(() => distinct(datasets.map((d) => d.year)).sort().reverse(), [datasets]);

  const filtered = datasets.filter(
    (d) =>
      (!subTheme || d.subTheme === subTheme) &&
      (!fileFormat || d.formats.includes(fileFormat)) &&
      (!type || d.type === type) &&
      (!geography || d.geography === geography) &&
      (!year || d.year === year)
  );

  const active = [subTheme, fileFormat, type, geography, year].filter(Boolean).length;
  const clear = () => {
    setSubTheme("");
    setFileFormat("");
    setType("");
    setGeography("");
    setYear("");
  };

  return (
    <div className={`grid gap-5 ${className}`}>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-[#e6e8f0] pb-5 max-sm:grid max-sm:grid-cols-2">
        {/* One sub-theme would be a filter with nothing to choose. */}
        <FacetSelect label="Sub-theme" options={subThemes.length > 1 ? subThemes : []} value={subTheme} onChange={setSubTheme} />
        <FacetSelect label="File format" options={formats} value={fileFormat} onChange={setFileFormat} />
        <FacetSelect label="Type" options={types} value={type} onChange={setType} />
        <FacetSelect label="Geography" options={geographies} value={geography} onChange={setGeography} />
        <FacetSelect label="Year" options={years} value={year} onChange={setYear} />
        <p className="text-[13px] text-[#5b5f74] max-sm:col-span-2 sm:ml-auto sm:pb-2.5">
          {filtered.length} of {datasets.length} {datasets.length === 1 ? "dataset" : "datasets"}
          {active > 0 && (
            <button type="button" onClick={clear} className="ml-3 font-semibold text-[#253D9A] hover:underline">
              Clear filters
            </button>
          )}
        </p>
      </div>

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
