import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "../../_ui/kit";
import DashboardCardLink from "./_ui/DashboardCardLink";
import { DASHBOARDS } from "./_lib/specs";

// Deferred to a later phase (2026-10-08): nothing links here and search engines are asked not to index it.
export const metadata: Metadata = { title: "Dashboards", robots: { index: false, follow: false } };

export default function DashboardsPage() {
  return (
    <>
      <PageHeader kicker="Data Repository & Library" title="Dashboards" intro="Interactive views of our datasets: the key figures, charts and the numbers behind them." />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <Link href="/data" className="text-[14px] font-semibold text-[#253D9A] hover:underline">
          &larr; All data
        </Link>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DASHBOARDS.map((d) => (
            <li key={d.slug}>
              <DashboardCardLink spec={d} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
