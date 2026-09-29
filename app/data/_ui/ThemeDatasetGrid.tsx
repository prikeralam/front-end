"use client";

import type { DatasetSummary } from "../../_lib/datasetTypes";
import DatasetFacetList from "./DatasetFacetList";
import DatasetRow from "./DatasetRow";

export default function ThemeDatasetGrid({ datasets }: { datasets: DatasetSummary[] }) {
  return <DatasetFacetList className="mt-8" datasets={datasets} renderRow={(d) => <DatasetRow key={d.slug} dataset={d} />} />;
}
