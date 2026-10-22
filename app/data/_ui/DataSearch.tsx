"use client";

import { useMemo, useState } from "react";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { filterDatasets } from "./datasetSearch";
import DatasetRow from "./DatasetRow";

/** Search across every dataset (title, catalog ID, place, source…), narrowed by an optional theme. Results appear below. Sits on the Data page's dark header band. */
export default function DataSearch({ datasets, themes }: { datasets: DatasetSummary[]; themes: string[] }) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("");
  const results = useMemo(() => filterDatasets(datasets, query, theme), [datasets, query, theme]);
  const active = query.trim().length > 0 || theme !== "";
  const what = [query.trim() && `“${query.trim()}”`, theme && `in ${theme}`].filter(Boolean).join(" ");

  return (
    <div className="grid gap-4">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="data-search" className="sr-only">
          Search datasets
        </label>
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6f7899]">
          <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          id="data-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search datasets, e.g. “Malappuram”, “Plus One”, “PRI-EDU-0012”"
          autoComplete="off"
          className="h-13 w-full rounded-lg border border-[#d9ddea] bg-white py-3.5 pl-11 pr-4 text-[15px] text-[#171a2b] shadow-[0_1px_2px_rgba(23,26,43,0.05)] outline-none transition-shadow placeholder:text-[#8b93b3] focus:border-[#253D9A] focus:ring-4 focus:ring-[#253D9A]/12"
        />
      </form>
      {themes.length > 0 && (
        <div role="group" aria-label="Filter by theme" className="flex flex-wrap items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#aebbf0]">Theme</span>
          {["", ...themes].map((t) => (
            <button
              key={t || "all"}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              className={`rounded-md border px-2.5 py-1 text-[12.5px] font-semibold transition-colors ${
                theme === t ? "border-white bg-white text-[#16245c] ring-2 ring-white/40" : "border-white/25 bg-white/10 text-white hover:border-white/60 hover:bg-white/15"
              }`}
            >
              {t || "All themes"}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="mt-2" aria-live="polite">
          <p className="mb-3 text-[13px] text-white/75">
            {results.length === 0 ? `No datasets ${what}.` : `${results.length} ${results.length === 1 ? "dataset" : "datasets"} ${what}`}
          </p>
          {results.length > 0 && (
            <div className="divide-y divide-[#e3e6f0] overflow-hidden rounded-lg border border-[#e3e6f0] bg-white">
              {results.map((d) => (
                <DatasetRow key={d.slug} dataset={d} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
