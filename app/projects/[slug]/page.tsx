import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoadError } from "../../_ui/ApiMessage";
import { load } from "../../_lib/api/load";
import { getProjectBySlug } from "../../_lib/api/projects";
import { heroProjectPhotos } from "../../_lib/stockPhotos";
import { PageHeader, StatusTag } from "../../_ui/kit";

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

  return (
    <>
      <PageHeader kicker="Project" title={project.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <StatusTag status={project.status} />
        <div className="relative mt-6 aspect-[3/2] overflow-hidden rounded-lg">
          <Image src={photo} alt={project.title} fill className="object-cover" sizes="(min-width: 768px) 700px, 100vw" />
        </div>
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{project.blurb}</p>
        <Link href="/" className="mt-10 inline-block rounded-md border border-[#dcdee8] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:border-[#253D9A]">
          &larr; Back to home
        </Link>
      </section>
    </>
  );
}
