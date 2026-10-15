import type { Metadata } from "next";
import CmsScreen from "../../_ui/CmsScreen";

export const metadata: Metadata = { title: "Documents" };

export default function ManageDocuments() {
  return <CmsScreen type="document" section="Content" title="Documents" intro="Annual reports, strategic plans and other files linked from the site." newLabel="New document" />;
}
