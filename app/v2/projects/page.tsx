import Link from "next/link";
import { projects } from "../../_content/projects";
import { PageHeader, StatusTag } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function ProjectsV2() {
  return (
    <>
      <PageHeader kicker="Projects" title="PRI's active projects" intro="Ongoing research initiatives, each tracked and reported on its own project page." />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.slug} href={`/v2/projects/${p.slug}`} className="block overflow-hidden rounded-xl border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(15,107,92,0.10)]">
              <MediaSlot need={p.image} />
              <div className="p-5">
                <h3 className="flex items-start gap-2 text-lg font-bold leading-snug text-[#171a2b]">
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
