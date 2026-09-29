import { NotPublishedYet, LoadError } from "../../_ui/ApiMessage";
import { load } from "../../_lib/api/load";
import { listPeopleByGroup } from "../../_lib/api/people";
import type { Person } from "../../_lib/types";
import PeopleGrid from "./PeopleGrid";

/** A heading plus the grid of published people in one group, with load-error and empty states. */
export default async function PeopleGroupSection({ group, heading, what }: { group: Person["group"]; heading: string; what: string }) {
  const result = await load(what, () => listPeopleByGroup(group));

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-6">
      {/* The page header already shows the group name; keep a heading for screen-reader navigation. */}
      <h2 className="sr-only">{heading}</h2>
      {!result.ok ? (
        <LoadError what={what} />
      ) : result.data.length === 0 ? (
        <NotPublishedYet>Profiles will be published here soon.</NotPublishedYet>
      ) : (
        <PeopleGrid people={result.data} groupLabel={heading} />
      )}
    </section>
  );
}
