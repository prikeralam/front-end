import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";

export default function AdvisoryPage() {
  return (
    <>
      <PageHeader kicker="People" title="Advisory Body" />
      <PeopleGroupSection group="advisory" heading="Advisory Body" what="the advisory body" />
    </>
  );
}
