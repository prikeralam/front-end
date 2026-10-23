import { notFound } from "next/navigation";
import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Patrons",
  description: "The chief patrons of the Policy and Research Initiative (PRI).",
  path: "/people/patrons",
});

export default function PatronsPage() {
  // Hidden for now (#242); delete this line to bring the page back.
  notFound();
  return (
    <>
      <PageHeader kicker="People" title="Patrons" />
      <PeopleGroupSection group="patron" heading="Patrons" what="our patrons" />
    </>
  );
}
