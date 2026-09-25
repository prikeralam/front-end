import { EmptyState, LoadError } from "../_ui/ApiMessage";
import { PageHeader } from "../_ui/kit";
import { load } from "../_lib/api/load";
import { listPublications } from "../_lib/api/publications";
import ResearchExplorer from "./_ui/ResearchExplorer";

export default async function ResearchV2() {
  const result = await load("research", listPublications);

  return (
    <>
      <PageHeader
        kicker="Research & Publications Hub"
        title="Our published and ongoing research"
        intro="Reports, working papers, and data stories across PRI's research themes."
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        {!result.ok ? (
          <LoadError what="our research" />
        ) : result.data.publications.length === 0 ? (
          <EmptyState>Research will be published here soon.</EmptyState>
        ) : (
          <ResearchExplorer publications={result.data.publications} authors={result.data.authors} />
        )}
      </section>
    </>
  );
}
