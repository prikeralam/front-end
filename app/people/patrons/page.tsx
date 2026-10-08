import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";

export default function PatronsPage() {
  return (
    <>
      <PageHeader kicker="People" title="Patrons" />
      <PeopleGroupSection group="patron" heading="Patrons" what="our patrons" />
    </>
  );
}
