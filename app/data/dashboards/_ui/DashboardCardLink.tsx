import Link from "next/link";
import type { DashboardSpec } from "../_lib/spec";

/** A dashboard in a list: theme, title, its finding, and whether it is still a prototype. */
export default function DashboardCardLink({ spec }: { spec: DashboardSpec }) {
  return (
    <Link
      href={`/data/dashboards/${spec.slug}`}
      className="group flex h-full flex-col rounded-lg border border-[#e3e6f0] bg-white p-6 transition-[border-color,box-shadow] hover:border-[#cdd6f3] hover:shadow-[0_12px_28px_-16px_rgba(23,26,43,0.35)]"
    >
      <p className="flex items-center justify-between gap-3 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em]">
        <span className="text-[#253D9A]">{spec.theme}</span>
        {spec.status === "prototype" && <span className="text-[#8a6412]">Prototype</span>}
      </p>
      <h3 className="mt-3 text-[18px] leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{spec.title}</h3>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#5b6280]">{spec.headline}</p>
      <p className="mt-4 text-[13px] font-semibold text-[#253D9A]">Open dashboard &rarr;</p>
    </Link>
  );
}
