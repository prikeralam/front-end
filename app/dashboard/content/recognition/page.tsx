import type { Metadata } from "next";
import CmsScreen from "../../_ui/CmsScreen";

export const metadata: Metadata = { title: "Recognition" };

export default function ManageRecognition() {
  return <CmsScreen type="recognition" section="Content" title="Recognition" intro="Awards, grants and memberships, shown on the Partners & recognition page." newLabel="New recognition" />;
}
