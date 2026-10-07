import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { PageHeader } from "../../_ui/kit";
import { getDatasetDetail, getDatasetPreviews } from "../../_lib/api/datasets";
import { load } from "../../_lib/api/load";
import DatasetAccess from "../_ui/DatasetAccess";
import DatasetView from "../_ui/DatasetView";
import { dashboardsUsing } from "../dashboards/_lib/specs";

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
  const usedIn = dashboardsUsing(ds.slug);

  return (
    <>
      <PageHeader kicker={`${ds.type ?? "Dataset"} · ${ds.theme ?? "Uncategorised"}`} title={ds.title} />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <DatasetView ds={ds} previews={previews} access={<DatasetAccess slug={ds.slug} accessState={ds.accessState} files={ds.files} />} />
        {usedIn.length > 0 && (
          <div className="mt-10 rounded-lg border border-[#e3e6f0] bg-white p-5">
            <h2 className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6f7899]">Explore in a dashboard</h2>
            <ul className="mt-3 grid gap-2">
              {usedIn.map((d) => (
                <li key={d.slug}>
                  <Link href={`/data/dashboards/${d.slug}`} className="text-[15px] font-semibold text-[#253D9A] hover:underline">
                    {d.title} &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
