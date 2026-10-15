import type { Metadata } from "next";
import CmsScreen from "../../_ui/CmsScreen";

export const metadata: Metadata = { title: "Job openings" };

export default function ManageJobs() {
  return <CmsScreen type="job" section="Engage" title="Job openings" intro="Open roles on the careers page. Applications for them arrive in Inbox, Applications." newLabel="New opening" />;
}
