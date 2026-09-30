import type { Metadata } from "next";
import Link from "next/link";
import { listDatasets } from "../../_lib/api/datasets";
import { listCollections } from "../../_lib/api/impact";
import { load } from "../../_lib/api/load";
import { LoadError, NotPublishedYet } from "../../_ui/ApiMessage";
import { PageHeader } from "../../_ui/kit";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const [collections, datasets] = await Promise.all([load("collections", listCollections), load("datasets", () => listDatasets())]);
  const visible = new Set(datasets.ok ? datasets.data.map((d) => d.slug) : []);

  return (
    <>
      <PageHeader kicker="Data Repository & Library" title="Collections" intro="Related datasets bundled by topic, such as everything behind one data story." />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <Link href="/data" className="text-[14px] font-semibold text-[#253D9A] hover:underline">
          &larr; All data
        </Link>
        {!collections.ok && <LoadError what="our collections" />}
        {collections.ok && collections.data.length === 0 && <NotPublishedYet>Collections will be published here soon.</NotPublishedYet>}
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(collections.ok ? collections.data : []).map((c) => {
            const count = c.datasetSlugs.filter((s) => visible.has(s)).length;
            return (
              <li key={c.slug}>
                <Link
                  href={`/data/collections/${c.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-[#e3e6f0] bg-white p-6 transition-[border-color,box-shadow] hover:border-[#cdd6f3] hover:shadow-[0_12px_28px_-16px_rgba(23,26,43,0.35)]"
                >
                  <p className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#253D9A]">Collection</p>
                  <h2 className="mt-3 text-[18px] leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{c.title}</h2>
                  {c.description && <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-relaxed text-[#5b6280]">{c.description}</p>}
                  <p className="mt-4 flex items-center justify-between text-[13px]">
                    <span className="font-[family-name:var(--font-mono)] text-[#6f7899]">
                      {count} {count === 1 ? "dataset" : "datasets"}
                    </span>
                    <span className="font-semibold text-[#253D9A]">View &rarr;</span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
