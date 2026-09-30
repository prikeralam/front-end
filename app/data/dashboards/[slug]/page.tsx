import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listDatasets } from "../../../_lib/api/datasets";
import { load } from "../../../_lib/api/load";
import { getPublicationBySlug } from "../../../_lib/api/publications";
import { PageHeader } from "../../../_ui/kit";
import { loadDashboardData } from "../_lib/loadDashboard";
import { datasetsOf } from "../_lib/spec";
import { dashboardBySlug } from "../_lib/specs";
import DashboardView from "../_ui/DashboardView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const spec = dashboardBySlug((await params).slug);
  return spec ? { title: spec.title, description: spec.summary } : {};
}

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const spec = dashboardBySlug((await params).slug);
  if (!spec) notFound();

  const [data, datasets, story] = await Promise.all([
    loadDashboardData(spec),
    load("datasets", () => listDatasets()),
    spec.story ? load("the data story", () => getPublicationBySlug(spec.story!)) : Promise.resolve(null),
  ]);
  const titles = new Map(datasets.ok ? datasets.data.map((d) => [d.slug, d.title]) : []);
  const storyTitle = story?.ok ? story.data?.publication.title : undefined;

  return (
    <>
      <PageHeader kicker={`Dashboard · ${spec.theme}`} title={spec.title} intro={spec.summary} />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/data/dashboards" className="text-[14px] font-semibold text-[#253D9A] hover:underline">
            &larr; All dashboards
          </Link>
          {spec.status === "prototype" && (
            <p className="rounded-full border border-[#ecd9ad] bg-[#fdf8ec] px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a6412]">
              Prototype · built from sample data
            </p>
          )}
        </div>

        <p className="mt-8 max-w-3xl border-l-[3px] border-[#C9972C] pl-4 text-balance text-[20px] leading-snug text-[#171a2b] sm:text-[23px]">{spec.headline}</p>

        <div className="mt-8">
          <DashboardView spec={spec} data={data} />
        </div>

        <aside className="mt-12 grid gap-6 rounded-lg border border-[#e3e6f0] bg-white p-6 sm:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6f7899]">About this data</h2>
            <ul className="mt-3 grid gap-2">
              {datasetsOf(spec).map((slug) => (
                <li key={slug}>
                  <Link href={`/data/${slug}`} className="text-[15px] font-semibold text-[#253D9A] hover:underline">
                    {titles.get(slug) ?? slug}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] leading-relaxed text-[#5b6280]">Sources, methods and downloads are on each dataset&rsquo;s page.</p>
          </div>
          {storyTitle && (
            <div>
              <h2 className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6f7899]">Read the story</h2>
              <Link href={`/research/${spec.story}`} className="mt-3 block text-[15px] font-semibold text-[#253D9A] hover:underline">
                {storyTitle} &rarr;
              </Link>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
