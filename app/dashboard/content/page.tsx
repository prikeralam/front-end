import type { Metadata } from "next";
import CmsScreen from "../_ui/CmsScreen";

export const metadata: Metadata = { title: "Pages & blocks" };

export default function ManageContentBlocks() {
  return <CmsScreen type="content-block" section="Content" title="Pages & blocks" intro="Text sections of the site's pages, such as the About page copy." newLabel="New content block" />;
}
