import type { Metadata } from "next";
import CmsScreen from "../../_ui/CmsScreen";

export const metadata: Metadata = { title: "Cited in" };

export default function ManageMentions() {
  return <CmsScreen type="mention" section="Content" title="Cited in" intro="Where PRI's research and data have been cited or covered, shown on the public Cited in page." newLabel="New mention" filterField="kind" />;
}
