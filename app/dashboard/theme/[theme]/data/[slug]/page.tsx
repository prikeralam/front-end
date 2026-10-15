import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { LoadError } from "../../../../../_ui/ApiMessage";
import DashboardPageHeader from "../../../../_ui/DashboardPageHeader";
import { getDatasetDetail, getDatasetPreviews } from "../../../../../_lib/api/datasets";
import { load } from "../../../../../_lib/api/load";
import { getAccessToken } from "../../../../../_lib/auth/serverAuth";
import DatasetAccess from "../../../../../data/_ui/DatasetAccess";
import DatasetView from "../../../../../data/_ui/DatasetView";

// Signed-in view: the caller's token decides what they can see (internal datasets for staff, files once approved).
// Cached per request, so the title and the page share one backend call.
const loadDataset = cache(async (slug: string) => {
  const accessToken = await getAccessToken().catch(() => null);
  return { accessToken, result: await load("this dataset", () => getDatasetDetail(slug, { accessToken })) };
});

export async function generateMetadata({ params }: { params: Promise<{ theme: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { result } = await loadDataset(slug);
  return { title: result.ok && result.data ? result.data.title : "Dataset" };
}

export default async function DashboardDatasetDetailPage({ params }: { params: Promise<{ theme: string; slug: string }> }) {
  const { theme: rawTheme, slug } = await params;
  const theme = decodeURIComponent(rawTheme);

  const { accessToken, result } = await loadDataset(slug);
  if (!result.ok) {
    return (
      <>
        <DashboardPageHeader trail={["Data", theme]} title="Dataset" />
        <section className="mx-auto max-w-4xl px-6 py-6 lg:px-8"><LoadError what="this dataset" /></section>
      </>
    );
  }
  const ds = result.data;
  if (!ds || ds.theme !== theme) notFound();

  const previews = await getDatasetPreviews(ds, { accessToken });

  return (
    <>
      <DashboardPageHeader trail={["Data", theme]} title={ds.title} />
      <section className="mx-auto max-w-4xl px-6 py-6 lg:px-8">
        <DatasetView ds={ds} previews={previews} access={<DatasetAccess slug={ds.slug} accessState={ds.accessState} files={ds.files} formats={ds.formats} />} />
      </section>
    </>
  );
}
