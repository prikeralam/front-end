import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../../_ui/ApiMessage";
import { listDatasets, listThemeNames } from "../../../_lib/api/datasets";
import { load } from "../../../_lib/api/load";
import { PageHeader } from "../../../_ui/kit";
import ThemeDatasetGrid from "../../_ui/ThemeDatasetGrid";

export default async function DataThemePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: rawTheme } = await params;
  const theme = decodeURIComponent(rawTheme);

  const [themeNames, datasets] = await Promise.all([load("themes", listThemeNames), load("datasets", listDatasets)]);
  if (themeNames.ok && !themeNames.data.includes(theme)) notFound();
  const themeDatasets = datasets.ok ? datasets.data.filter((d) => d.theme === theme) : [];

  return (
    <>
      <PageHeader
        kicker="Data Repository & Library"
        title={theme}
        intro={datasets.ok ? `${themeDatasets.length} ${themeDatasets.length === 1 ? "dataset" : "datasets"} in this theme.` : undefined}
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/data" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; All themes</Link>
        {datasets.ok ? <ThemeDatasetGrid datasets={themeDatasets} /> : <LoadError what="the datasets in this theme" />}
      </section>
    </>
  );
}
