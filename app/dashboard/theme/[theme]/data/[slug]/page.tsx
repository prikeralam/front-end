import { notFound } from "next/navigation";
import { LoadError } from "../../../../../_ui/ApiMessage";
import DashboardPageHeader from "../../../../_ui/DashboardPageHeader";
import { getDatasetDetail, getDatasetPreviews } from "../../../../../_lib/api/datasets";
import { load } from "../../../../../_lib/api/load";
import { getAccessToken } from "../../../../../_lib/auth/serverAuth";
import DatasetAccess from "../../../../../data/_ui/DatasetAccess";
import DatasetView from "../../../../../data/_ui/DatasetView";

export default async function DashboardDatasetDetailPage({ params }: { params: Promise<{ theme: string; slug: string }> }) {
  const { theme: rawTheme, slug } = await params;
  const theme = decodeURIComponent(rawTheme);

  // Signed-in view: the caller's token decides what they can see (internal datasets for staff, files once approved).
  const accessToken = await getAccessToken().catch(() => null);
  const result = await load("this dataset", () => getDatasetDetail(slug, { accessToken }));
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
        <DatasetView ds={ds} previews={previews} access={<DatasetAccess slug={ds.slug} accessState={ds.accessState} files={ds.files} />} />
      </section>
    </>
  );
}
