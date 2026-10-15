import type { Metadata } from "next";
import CmsScreen from "../../_ui/CmsScreen";

export const metadata: Metadata = { title: "Events & campaigns" };

export default function ManageEvents() {
  return <CmsScreen type="event" section="Engage" title="Events & campaigns" intro="Events and campaigns on the Events & Campaigns page and the homepage." newLabel="New event or campaign" />;
}
