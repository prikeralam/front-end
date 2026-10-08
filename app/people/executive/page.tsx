import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Executive Council",
  description: "The Executive Council that governs the Policy and Research Initiative (PRI).",
  path: "/people/executive",
});

export default function ExecutiveCouncilPage() {
  return (
    <>
      <PageHeader kicker="People" title="Executive Council" />
      <PeopleGroupSection group="executive" heading="Executive Council" what="the executive council" />
    </>
  );
}
