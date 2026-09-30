"use client";

import { useMemo, useState } from "react";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { matchesQuery } from "./datasetSearch";
import DatasetRow from "./DatasetRow";

/** Search across every dataset, with the themes as one-tap searches. Results replace nothing; they appear below. */
export default function DataSearch({ datasets, suggestions }: { datasets: DatasetSummary[]; suggestions: string[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => datasets.filter((d) => matchesQuery(d, query)), [datasets, query]);
  const searching = query.trim().length > 0;

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
          placeholder="Search datasets, e.g. “Malappuram”, “Plus One”, “health”"
          autoComplete="off"
          className="h-13 w-full rounded-lg border border-[#d9ddea] bg-white py-3.5 pl-11 pr-4 text-[15px] text-[#171a2b] shadow-[0_1px_2px_rgba(23,26,43,0.05)] outline-none transition-shadow placeholder:text-[#8b93b3] focus:border-[#253D9A] focus:ring-4 focus:ring-[#253D9A]/12"
        />
      </form>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6f7899]">Popular</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(query === s ? "" : s)}
              aria-pressed={query === s}
              className={`rounded-md border px-2.5 py-1 text-[12.5px] font-semibold transition-colors ${
                query === s ? "border-[#253D9A] bg-[#253D9A] text-white" : "border-[#d9ddea] bg-white text-[#3a4263] hover:border-[#253D9A] hover:text-[#253D9A]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {searching && (
        <div className="mt-2" aria-live="polite">
          <p className="mb-3 text-[13px] text-[#5b6280]">
            {results.length === 0 ? `No datasets match “${query.trim()}”.` : `${results.length} ${results.length === 1 ? "dataset" : "datasets"} for “${query.trim()}”`}
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
