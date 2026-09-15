import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../_content/projects";
import { heroProjectPhotos } from "../../_lib/stockPhotos";
import { PageHeader, StatusTag } from "../../_ui/kit";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <PageHeader kicker="Project" title={project.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <StatusTag status={project.status} />
        <div className="relative mt-6 aspect-[3/2] overflow-hidden rounded-xl">
          <Image src={heroProjectPhotos[project.slug]} alt={project.title} fill className="object-cover" sizes="(min-width: 768px) 700px, 100vw" />
        </div>
        <p className="mt-8 text-lg leading-relaxed text-[#4b4f66]">{project.blurb}</p>
        <Link href="/" className="mt-10 inline-block rounded-full border border-[#dcdee8] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:border-[#253D9A]">
          &larr; Back to home
        </Link>
      </section>
    </>
  );
}
