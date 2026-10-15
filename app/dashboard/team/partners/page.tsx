import type { Metadata } from "next";
import CmsScreen from "../../_ui/CmsScreen";

export const metadata: Metadata = { title: "Partners" };

export default function ManagePartners() {
  return <CmsScreen type="partner" section="People" title="Partners" intro="Partner institutions and researchers listed on the site." newLabel="New partner" />;
}
