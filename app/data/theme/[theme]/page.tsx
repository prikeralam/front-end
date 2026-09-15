import Link from "next/link";
import { notFound } from "next/navigation";
import { datasets, datasetThemes } from "../../../_content/datasets";
import { PageHeader } from "../../../_ui/kit";
import ThemeDatasetGrid from "../../_ui/ThemeDatasetGrid";

export function generateStaticParams() {
  return datasetThemes.map((theme) => ({ theme: encodeURIComponent(theme) }));
}

export default async function DataThemeV2({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: rawTheme } = await params;
  const theme = decodeURIComponent(rawTheme);
  if (!datasetThemes.includes(theme)) notFound();

  const themeDatasets = datasets.filter((d) => d.theme === theme);

  return (
    <>
      <PageHeader
        kicker="Data Repository & Library"
        title={theme}
        intro={`${themeDatasets.length} ${themeDatasets.length === 1 ? "dataset" : "datasets"} in this theme.`}
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/data" className="text-[14px] font-semibold text-[#253D9A] hover:underline">&larr; All themes</Link>
        <ThemeDatasetGrid datasets={themeDatasets} />
      </section>
    </>
  );
}
