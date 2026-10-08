import { PageHeader } from "../../_ui/kit";
import PeopleGroupSection from "../_ui/PeopleGroupSection";
import { pageMetadata } from "../../_lib/seo";

export const metadata = pageMetadata({
  title: "Advisory Body",
  description: "The advisors who guide the Policy and Research Initiative's research direction and strategy.",
  path: "/people/advisory",
});

export default function AdvisoryPage() {
  return (
    <>
      <PageHeader kicker="People" title="Advisory Body" />
      <PeopleGroupSection group="advisory" heading="Advisory Body" what="the advisory body" />
    </>
  );
}
