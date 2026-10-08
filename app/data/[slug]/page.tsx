import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { PageHeader } from "../../_ui/kit";
import { getDatasetDetail, getDatasetPreviews } from "../../_lib/api/datasets";
import { load } from "../../_lib/api/load";
import DatasetAccess from "../_ui/DatasetAccess";
import DatasetView from "../_ui/DatasetView";

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
      <PageHeader kicker={`${ds.type ?? "Dataset"} · ${ds.theme ?? "Uncategorised"}`} title={ds.title} />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <DatasetView ds={ds} previews={previews} access={<DatasetAccess slug={ds.slug} accessState={ds.accessState} files={ds.files} />} />
      </section>
    </>
  );
}
