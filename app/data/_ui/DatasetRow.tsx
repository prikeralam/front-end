import Link from "next/link";
import type { DatasetSummary } from "../../_lib/datasetTypes";

const access: Record<DatasetSummary["visibility"], { label: string; tone: string }> = {
  public: { label: "Public", tone: "bg-[#e7f5ee] text-[#1f7a4d]" },
  "on-request": { label: "On request", tone: "bg-[#fdf3e3] text-[#9a6412]" },
  internal: { label: "Internal", tone: "bg-[#eef0f5] text-[#4f5878]" },
};

const numberFormat = new Intl.NumberFormat("en-IN");

/** One dataset in a list: what it is, where it's from, its shape, its format and who can get it. */
export default function DatasetRow({ dataset: d, href = `/data/${d.slug}` }: { dataset: DatasetSummary; href?: string }) {
  const facts = [
    d.source,
    d.granularity && `By ${d.granularity}`,
    d.timePeriod ?? d.year,
    d.rowCount !== undefined && `${numberFormat.format(d.rowCount)} rows`,
  ].filter(Boolean);
  const tag = access[d.visibility];

  return (
    <Link href={href} className="group flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-5 py-4 transition-colors hover:bg-[#f7f8fc]">
      <div className="min-w-0 flex-1 basis-72">
        <h3 className="text-[16px] leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{d.title}</h3>
        {d.description && <p className="mt-1 line-clamp-2 max-w-2xl text-[13.5px] leading-relaxed text-[#5b6280]">{d.description}</p>}
        {facts.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-[family-name:var(--font-mono)] text-[11.5px] text-[#6f7899]">
            {facts.map((fact, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#c2c8dc]" />}
                {fact}
              </span>
            ))}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {d.fileFormat && (
          <span className="rounded bg-[#171a2b]/5 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#171a2b]">{d.fileFormat}</span>
        )}
        <span className={`flex items-center gap-1 rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] ${tag.tone}`}>
          {d.visibility !== "public" && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
            </svg>
          )}
          {tag.label}
        </span>
      </div>
    </Link>
  );
}
