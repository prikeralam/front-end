import Link from "next/link";
import { notFound } from "next/navigation";
import { listDatasets } from "../../../_lib/api/datasets";
import { getCollection } from "../../../_lib/api/impact";
import { load } from "../../../_lib/api/load";
import { listPublications } from "../../../_lib/api/publications";
import type { DatasetSummary } from "../../../_lib/datasetTypes";
import { LoadError, NotPublishedYet } from "../../../_ui/ApiMessage";
import { PageHeader } from "../../../_ui/kit";
import DatasetRow from "../../_ui/DatasetRow";
import type { Metadata } from "next";
import { pageMetadata } from "../../../_lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load("this collection", () => getCollection(slug));
  const c = result.ok ? result.data : null;
  if (!c) return { title: "Collections" };
  return pageMetadata({ title: `${c.title} (data collection)`, description: c.description, path: `/data/collections/${c.slug}` });
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [collection, datasets, publications] = await Promise.all([
    load("this collection", () => getCollection(slug)),
    load("datasets", () => listDatasets()),
    load("publications", listPublications),
  ]);
  if (!collection.ok) {
    return (
      <>
        <PageHeader kicker="Collection" title="Collection" />
        <section className="mx-auto max-w-6xl px-6 py-14">
          <LoadError what="this collection" />
        </section>
      </>
    );
  }
  const c = collection.data;
  if (!c) notFound();

  // Keep the collection's own order; the dataset list only includes what this visitor may see.
  const bySlug = new Map((datasets.ok ? datasets.data : []).map((d) => [d.slug, d]));
  const members = c.datasetSlugs.map((s) => bySlug.get(s)).filter((d): d is DatasetSummary => Boolean(d));
  const story = c.publicationSlug && publications.ok ? publications.data.publications.find((p) => p.slug === c.publicationSlug) : undefined;

  return (
    <>
      <PageHeader kicker="Collection" title={c.title} intro={c.description || undefined} />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/data/collections" className="text-[14px] font-semibold text-[#253D9A] hover:underline">
            &larr; All collections
          </Link>
          {story && (
            <Link href={`/research/${story.slug}`} className="inline-flex items-center gap-2 rounded-md border border-[#cdd6f3] bg-white px-3.5 py-2 text-[13.5px] font-semibold text-[#253D9A] hover:border-[#253D9A]">
              Read the data story: {story.title} <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
        <p className="mt-8 font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6f7899]">
          {members.length} {members.length === 1 ? "dataset" : "datasets"}
        </p>
        {!datasets.ok && <LoadError what="the datasets in this collection" />}
        {datasets.ok && members.length === 0 && <NotPublishedYet>The datasets in this collection will be published soon.</NotPublishedYet>}
        {members.length > 0 && (
          <div className="mt-3 divide-y divide-[#e3e6f0] overflow-hidden rounded-lg border border-[#e3e6f0] bg-white">
            {members.map((d) => (
              <DatasetRow key={d.slug} dataset={d} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
