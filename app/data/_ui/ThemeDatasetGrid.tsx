"use client";

import Link from "next/link";
import type { DatasetSummary } from "../../_lib/datasetTypes";
import DatasetFacetList, { DatasetIcon } from "./DatasetFacetList";
import DatasetMeta from "./DatasetMeta";

const visibilityLabel: Record<string, string> = { public: "Public", "on-request": "On request", internal: "Internal only" };

export default function ThemeDatasetGrid({ datasets }: { datasets: DatasetSummary[] }) {
  return (
    <DatasetFacetList
      className="mt-8"
      datasets={datasets}
      renderRow={(d) => (
        <Link
          key={d.slug}
          href={`/data/${d.slug}`}
          className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#fafbfc]"
        >
          <div className="flex min-w-0 flex-1 gap-4">
            <DatasetIcon />
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
      )}
    />
  );
}
