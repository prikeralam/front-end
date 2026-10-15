import type { Metadata } from "next";
import CmsScreen from "../_ui/CmsScreen";

export const metadata: Metadata = { title: "Collections" };

export default function ManageCollections() {
  return <CmsScreen type="collection" section="Data" title="Collections" intro="Bundles of related datasets, such as everything behind one data story." newLabel="New collection" />;
}
