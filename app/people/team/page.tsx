import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Our Team",
  description: "The team that runs the Policy and Research Initiative's research, data and operations.",
  path: "/people/team",
});

export default function TeamPage() {
  return (
    <>
      <PageHeader kicker="People" title="Our Team" />
      <PeopleGroupSection group="team" heading="Our Team" what="our team" />
    </>
  );
}
