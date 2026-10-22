import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { PageHeader } from "../../_ui/kit";
import { getDatasetDetail, getDatasetPreviews } from "../../_lib/api/datasets";
import { load } from "../../_lib/api/load";
import DatasetAccess from "../_ui/DatasetAccess";
import DatasetView from "../_ui/DatasetView";
import type { Metadata } from "next";
import { datasetJsonLd, pageMetadata } from "../../_lib/seo";
import JsonLd from "../../_ui/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load("this dataset", () => getDatasetDetail(slug));
  const ds = result.ok ? result.data : null;
  if (!ds) return { title: "Dataset" };
  const facts = [ds.geography, ds.timePeriod || ds.year, ds.formats.join(", ")].filter(Boolean).join(" · ");
  return pageMetadata({
    title: `${ds.title} (dataset)`,
    description: [ds.description, facts && `Data: ${facts}.`].filter(Boolean).join(" ") || `${ds.title}, a dataset in PRI's data repository.`,
    path: `/data/${ds.slug}`,
  });
}

export default async function DatasetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load("this dataset", () => getDatasetDetail(slug));
  if (!result.ok) {
    return (
      <>
        <PageHeader kicker="Data Repository & Library" title="Dataset" />
        <section className="mx-auto max-w-3xl px-6 py-16"><LoadError what="this dataset" /></section>
      </>
    );
  }
  const ds = result.data;
  if (!ds) notFound();

  const previews = await getDatasetPreviews(ds);

  return (
    <>
      <JsonLd data={datasetJsonLd(ds)} />
      <PageHeader kicker={`${ds.type ?? "Dataset"} · ${ds.theme ?? "Uncategorised"}`} title={ds.title} />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <DatasetView ds={ds} previews={previews} access={<DatasetAccess slug={ds.slug} accessState={ds.accessState} files={ds.files} formats={ds.formats} />} />
      </section>
    </>
  );
}
