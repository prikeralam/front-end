import type { Metadata } from "next";
import { listDatasets } from "../_lib/api/datasets";
import { listMentions } from "../_lib/api/impact";
import { load } from "../_lib/api/load";
import { listPublications } from "../_lib/api/publications";
import { LoadError, NotPublishedYet } from "../_ui/ApiMessage";
import { PageHeader } from "../_ui/kit";
import MentionList from "./MentionList";

export const metadata: Metadata = { title: "Cited in" };

export default async function CitedInPage() {
  const [mentions, publications, datasets] = await Promise.all([
    load("mentions", listMentions),
    load("publications", listPublications),
    load("datasets", () => listDatasets()),
  ]);

  // The PRI work each mention cites, by prefixed slug, for "Cites …" links. Unknown slugs are simply not linked.
  const cited: Record<string, { href: string; title: string }> = {};
  for (const p of publications.ok ? publications.data.publications : []) cited[`p:${p.slug}`] = { href: `/research/${p.slug}`, title: p.title };
  for (const d of datasets.ok ? datasets.data : []) cited[`d:${d.slug}`] = { href: `/data/${d.slug}`, title: d.title };

  return (
    <>
      <PageHeader
        kicker="Engage"
        title="Cited in"
        intro="Where PRI's research and data have been used: news coverage, research papers, reports and the legislature. Every card links to the original."
      />
      <section className="mx-auto max-w-6xl px-6 py-14">
        {!mentions.ok && <LoadError what="where PRI has been cited" />}
        {mentions.ok && mentions.data.length === 0 && <NotPublishedYet>Coverage and citations will be listed here soon.</NotPublishedYet>}
        {mentions.ok && mentions.data.length > 0 && <MentionList mentions={mentions.data} cited={cited} />}
      </section>
    </>
  );
}
