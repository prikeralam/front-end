import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../../_ui/ApiMessage";
import { listDatasets, listTopThemes } from "../../../_lib/api/datasets";
import { load } from "../../../_lib/api/load";
import { PageHeader } from "../../../_ui/kit";
import ThemeDatasetGrid from "../../_ui/ThemeDatasetGrid";
import type { Metadata } from "next";
import { pageMetadata } from "../../../_lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ theme: string }> }): Promise<Metadata> {
  const theme = decodeURIComponent((await params).theme);
  const themes = await load("themes", listTopThemes);
  const info = themes.ok ? themes.data.find((t) => t.name === theme) : undefined;
  return pageMetadata({
    title: `${theme} data`,
    description: info?.description || `${theme} datasets for Kerala from the Policy and Research Initiative's data repository.`,
    path: `/data/theme/${encodeURIComponent(theme)}`,
  });
}

export default async function DataThemePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: rawTheme } = await params;
  const theme = decodeURIComponent(rawTheme);

  const [themes, datasets] = await Promise.all([load("themes", listTopThemes), load("datasets", listDatasets)]);
  const themeInfo = themes.ok ? themes.data.find((t) => t.name === theme) : undefined;
  if (themes.ok && !themeInfo) notFound();
  const themeDatasets = datasets.ok ? datasets.data.filter((d) => d.theme === theme) : [];
  const count = datasets.ok ? `${themeDatasets.length} ${themeDatasets.length === 1 ? "dataset" : "datasets"} in this theme.` : "";

  return (
    <>
      <PageHeader
        kicker="Data Repository & Library"
        title={theme}
        intro={[themeInfo?.description, count].filter(Boolean).join(" ") || undefined}
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/data" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; All themes</Link>
        {datasets.ok ? <ThemeDatasetGrid datasets={themeDatasets} /> : <LoadError what="the datasets in this theme" />}
      </section>
    </>
  );
}
