import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";

export default function AdvisoryV2() {
  return (
    <>
      <PageHeader kicker="People" title="Advisory Body" intro="Advisors who guide PRI's research direction and institutional strategy." />
      <PeopleGroupSection group="advisory" heading="Advisory Body" what="the advisory body" />
    </>
  );
}
