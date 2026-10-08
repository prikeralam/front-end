import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";

export default function TeamPage() {
  return (
    <>
      <PageHeader kicker="People" title="Our Team" />
      <PeopleGroupSection group="team" heading="Our Team" what="our team" />
    </>
  );
}
