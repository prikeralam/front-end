import type { Metadata } from "next";
import CmsScreen from "../_ui/CmsScreen";

export const metadata: Metadata = { title: "Datasets" };

export default function ManageDatasetsPage() {
  return <CmsScreen type="dataset" section="Data" title="Datasets" intro="Datasets in the public Data Repository, and those waiting for review." newLabel="New dataset" />;
}
