import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";

export default function ExecutiveCouncilPage() {
  return (
    <>
      <PageHeader kicker="People" title="Executive Council" intro="PRI's governing council, chaired and staffed by 13 members." />
      <PeopleGroupSection group="executive" heading="Executive Council" what="the executive council" />
    </>
  );
}
