import Link from "next/link";
import { projects } from "../../_content/projects";
import { PageHeader, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function ProjectsV1() {
  return (
    <>
      <PageHeader kicker="Projects" title="PRI's active projects" intro="Ongoing research initiatives, each tracked and reported on its own project page." />
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.slug} href={`/v1/projects/${p.slug}`} className="block border border-[#253D9A]/12 bg-white transition-colors hover:border-[#253D9A]/40">
              <MediaSlot need={p.image} />
              <div className="p-5">
                <h3 className="flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">
                  {p.title}
                  <StatusTag status={p.status} />
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#5b5f74]">{p.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
