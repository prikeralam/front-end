import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Patrons",
  description: "The chief patrons of the Policy and Research Initiative (PRI).",
  path: "/people/patrons",
});

export default function PatronsPage() {
  return (
    <>
      <PageHeader kicker="People" title="Patrons" />
      <PeopleGroupSection group="patron" heading="Patrons" what="our patrons" />
    </>
  );
}
