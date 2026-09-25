import { notFound } from "next/navigation";
import { LoadError } from "../../../../../_ui/ApiMessage";
import { PageHeader } from "../../../../../_ui/kit";
import { getDatasetDetail, getDatasetPreviews } from "../../../../../_lib/api/datasets";
import { load } from "../../../../../_lib/api/load";
import { getAccessToken } from "../../../../../_lib/auth/serverAuth";
import DatasetAccess from "../../../../../data/_ui/DatasetAccess";
import DatasetView from "../../../../../data/_ui/DatasetView";

export default async function DashboardDatasetDetailV2({ params }: { params: Promise<{ theme: string; slug: string }> }) {
  const { theme: rawTheme, slug } = await params;
  const theme = decodeURIComponent(rawTheme);

  // Signed-in view: the caller's token decides what they can see (internal datasets for staff, files once approved).
  const accessToken = await getAccessToken().catch(() => null);
  const result = await load("this dataset", () => getDatasetDetail(slug, { accessToken }));
  if (!result.ok) {
    return (
      <>
        <PageHeader kicker="Your dashboard" title="Dataset" />
        <section className="mx-auto max-w-3xl px-6 py-16"><LoadError what="this dataset" /></section>
      </>
    );
  }
  const ds = result.data;
  if (!ds || ds.theme !== theme) notFound();

  const previews = await getDatasetPreviews(ds, { accessToken });

  return (
    <>
      <PageHeader kicker="Your dashboard" title={ds.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <DatasetView ds={ds} previews={previews} access={<DatasetAccess slug={ds.slug} accessState={ds.accessState} downloadUrl={ds.files[0]?.path ?? null} />} />
      </section>
    </>
  );
}
