"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { publications, publicationThemes, publicationFormats, publicationLanguages } from "../../_content/publications";
import { people } from "../../_content/people";
import { stockPhotoFor } from "../../_lib/stockPhotos";
import { PageHeader, FilterBar, StatusTag, EmptyState } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

const sortOptions = ["Latest", "Most read"];

function authorFor(slug: string) {
  return people.find((p) => p.slug === slug);
}

export default function ResearchV1() {
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState(sortOptions[0]);

  const filtered = useMemo(() => {
    const list = publications.filter(
      (p) => (!theme || p.theme === theme) && (!format || p.format === format) && (!language || p.language === language)
    );
    return [...list].sort((a, b) => (sort === "Most read" ? b.views - a.views : b.date.localeCompare(a.date)));
  }, [theme, format, language, sort]);

  return (
    <>
      <PageHeader
        kicker="Research & Publications Hub"
        title="Our published and ongoing research"
        intro="Reports, working papers, and data stories across PRI's research themes."
      />
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <FilterBar
          facets={[
            { label: "Theme", options: publicationThemes, value: theme, onChange: setTheme },
            { label: "Format", options: publicationFormats, value: format, onChange: setFormat },
            { label: "Language", options: publicationLanguages, value: language, onChange: setLanguage },
            { label: "Sort by", options: sortOptions, value: sort, onChange: setSort },
          ]}
        />
        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState message="No publications match these filters." />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const author = authorFor(p.authors[0]);
              return (
                <Link key={p.slug} href={`/v1/research/${p.slug}`} className="block border border-[#253D9A]/12 bg-white transition-colors hover:border-[#253D9A]/40">
                  {p.cover && <MediaSlot need={p.cover} />}
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wide text-[#C9972C]">{p.format}</span>
                      <span className="text-[11px] text-[#8b8fa3]">{p.theme}</span>
                      <span className="text-[11px] text-[#8b8fa3]">&middot; {p.language}</span>
                    </div>
                    <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">
                      {p.title}
                      <StatusTag status={p.status} />
                    </h3>
                    <div className="mt-4 flex items-center gap-2">
                      {author?.photo && (
                        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#f7f7f3]">
                          <Image src={author.photo.src ?? stockPhotoFor(author.photo) ?? ""} alt={author.name} fill sizes="28px" className="object-cover" />
                        </div>
                      )}
                      <p className="text-[13px] text-[#8b8fa3]">{author?.name ?? p.authors.join(", ")} &middot; {p.date}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
