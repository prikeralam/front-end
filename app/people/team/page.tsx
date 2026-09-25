import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";

export default function TeamV2() {
  return (
    <>
      <PageHeader kicker="People" title="Our Team" intro="PRI's staff, who run the day-to-day work of the institute." />
      <PeopleGroupSection group="team" heading="Our Team" what="our team" />
    </>
  );
}
