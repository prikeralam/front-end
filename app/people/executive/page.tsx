import { notFound } from "next/navigation";
import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Executive Council",
  description: "The Executive Council that governs the Policy and Research Initiative (PRI).",
  path: "/people/executive",
});

export default function ExecutiveCouncilPage() {
  // Hidden for now (#242); delete this line to bring the page back.
  notFound();
  return (
    <>
      <PageHeader kicker="People" title="Executive Council" />
      <PeopleGroupSection group="executive" heading="Executive Council" what="the executive council" />
    </>
  );
}
