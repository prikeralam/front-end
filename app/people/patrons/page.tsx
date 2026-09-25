import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";

export default function PatronsV2() {
  return (
    <>
      <PageHeader kicker="People" title="Patrons" intro="Individuals who lend PRI their name and support." />
      <PeopleGroupSection group="patron" heading="Patrons" what="our patrons" />
    </>
  );
}
