import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { heroProjects } from "../../../_content/projects";
import { heroProjectPhotos } from "../../../_lib/stockPhotos";
import { PageHeader, StatusTag } from "../../_ui/kit";

export function generateStaticParams() {
  return heroProjects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailV3({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = heroProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <PageHeader kicker="Project" title={project.title} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <StatusTag status={project.status} />
        <div className="relative mt-6 aspect-[3/2] overflow-hidden border border-[#e6dbc7]">
          <Image src={heroProjectPhotos[project.slug]} alt={project.title} fill className="object-cover" sizes="(min-width: 768px) 700px, 100vw" />
        </div>
        <p className="mt-8 text-[17px] leading-relaxed text-[#4b4f66]">{project.blurb}</p>
        <Link href="/v3" className="mt-10 inline-block border border-[#20368a] px-6 py-3 text-sm font-semibold text-[#20368a] hover:bg-[#20368a] hover:text-white">
          &larr; Back to home
        </Link>
      </section>
    </>
  );
}
