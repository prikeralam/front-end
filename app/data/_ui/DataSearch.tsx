"use client";

import { useMemo, useState } from "react";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import { matchesQuery } from "./datasetSearch";
import DatasetRow from "./DatasetRow";
import Pager from "./Pager";
import { pageOf } from "./paging";

/** Search across every dataset. Results replace nothing; they appear below. Sits on the Data page's dark header band. */
export default function DataSearch({ datasets }: { datasets: DatasetSummary[] }) {
  const [query, setQueryText] = useState("");
  const [page, setPage] = useState(1);
  const setQuery = (q: string) => {
    setQueryText(q);
    setPage(1);
  };
  const results = useMemo(() => datasets.filter((d) => matchesQuery(d, query)), [datasets, query]);
  const searching = query.trim().length > 0;
  const shown = pageOf(results, page);

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
          placeholder="Search datasets, e.g. “Census 2011” or “Kerala School List”"
          autoComplete="off"
          className="h-13 w-full rounded-lg border border-[#d9ddea] bg-white py-3.5 pl-11 pr-4 text-[15px] text-[#171a2b] shadow-[0_1px_2px_rgba(23,26,43,0.05)] outline-none transition-shadow placeholder:text-[#8b93b3] focus:border-[#253D9A] focus:ring-4 focus:ring-[#253D9A]/12"
        />
      </form>
      {searching && (
        <div className="mt-2" aria-live="polite">
          <p className="mb-3 text-[13px] text-white/75">
            {results.length === 0 ? `No datasets match “${query.trim()}”.` : `${results.length} ${results.length === 1 ? "dataset" : "datasets"} for “${query.trim()}”`}
          </p>
          {results.length > 0 && (
            <>
              <div className="divide-y divide-[#e3e6f0] overflow-hidden rounded-lg border border-[#e3e6f0] bg-white">
                {shown.items.map((d) => (
                  <DatasetRow key={d.slug} dataset={d} />
                ))}
              </div>
              <Pager page={shown.page} pages={shown.pages} onChange={setPage} tone="dark" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
