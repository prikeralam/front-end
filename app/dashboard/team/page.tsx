import type { Metadata } from "next";
import CmsScreen from "../_ui/CmsScreen";

export const metadata: Metadata = { title: "Team directory" };

export default function ManagePeople() {
  return <CmsScreen type="person-profile" section="People" title="Team directory" intro="Team, patrons, executive council, advisory body, fellows and authors." newLabel="New person" filterField="group" />;
}
