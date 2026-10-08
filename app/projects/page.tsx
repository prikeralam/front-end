import Link from "next/link";
import { NotPublishedYet, LoadError } from "../_ui/ApiMessage";
import { load } from "../_lib/api/load";
import { listProjects } from "../_lib/api/projects";
import { PageHeader } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";
import ProjectStageTag from "../_ui/ProjectStageTag";

export default async function ProjectsPage() {
  const result = await load("projects", listProjects);

  return (
    <>
      <PageHeader kicker="Projects" title="Our projects" intro="PRI's research initiatives, ongoing and completed, each with its own project page." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        {!result.ok && <LoadError what="our projects" />}
        {result.ok && result.data.length === 0 && <NotPublishedYet>Projects will be listed here soon.</NotPublishedYet>}
        <div className="grid gap-5 sm:grid-cols-3">
          {(result.ok ? result.data : []).map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="block overflow-hidden rounded-lg border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(23,26,43,0.10)]">
              <MediaSlot need={p.image} />
              <div className="grid gap-2 p-5">
                {p.stage && <ProjectStageTag stage={p.stage} />}
                <h3 className="text-lg font-bold leading-snug text-[#171a2b]">{p.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#5b5f74]">{p.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
