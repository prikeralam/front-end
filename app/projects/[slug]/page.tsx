import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { load } from "../../_lib/api/load";
import { getProjectBySlug } from "../../_lib/api/projects";
import { heroProjectPhotos } from "../../_lib/stockPhotos";
import { PageHeader } from "../../_ui/kit";
import ProjectStageTag from "../../_ui/ProjectStageTag";
import ProjectDetails from "../_ui/ProjectDetails";
import type { Metadata } from "next";
import { pageMetadata } from "../../_lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load("this project", () => getProjectBySlug(slug));
  const project = result.ok ? result.data : null;
  if (!project) return { title: "Projects" };
  return pageMetadata({ title: project.title, description: project.blurb, path: `/projects/${project.slug}`, image: project.image.src ?? heroProjectPhotos[project.slug] });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load("this project", () => getProjectBySlug(slug));
  if (!result.ok) {
    return (
      <>
        <PageHeader kicker="Project" title="Project" />
        <section className="mx-auto max-w-3xl px-6 py-16"><LoadError what="this project" /></section>
      </>
    );
  }
  const project = result.data;
  if (!project) notFound();
  const photo = project.image.src ?? heroProjectPhotos[project.slug];
  const facts = project.facts ?? [];

  return (
    <>
      <PageHeader kicker="Project" title={project.title} intro={project.blurb} />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        {/* The fact sheet comes first in the markup, so phones see it before the write-up. */}
        <aside className="lg:order-2">
          <div className="rounded-lg border border-[#e6e8f0] bg-white p-6 lg:sticky lg:top-24">
            {project.stage && <ProjectStageTag stage={project.stage} />}
            {facts.length > 0 && (
              <dl className="mt-5">
                {facts.map((fact, i) => (
                  <div key={i} className="border-t border-[#eceef5] py-3.5 first:border-t-0 first:pt-0">
                    {fact.label && <dt className="font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8fa3]">{fact.label}</dt>}
                    <dd className="mt-1 text-[15px] leading-snug text-[#171a2b]">{fact.text}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link href="/projects" className={`${facts.length ? "mt-2" : "mt-5"} inline-block text-[14px] font-semibold text-[#253D9A] hover:underline`}>
              &larr; All projects
            </Link>
          </div>
        </aside>

        <div className="min-w-0 lg:order-1">
          <div className={`relative aspect-[3/2] overflow-hidden rounded-lg ${project.details ? "mb-12" : ""}`}>
            <Image src={photo} alt={project.title} fill className="object-cover" sizes="(min-width: 1024px) 760px, 100vw" priority />
          </div>
          {project.details && <ProjectDetails text={project.details} />}
        </div>
      </div>
    </>
  );
}
