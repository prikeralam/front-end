"use client";

import { useState } from "react";
import Link from "next/link";
import { publications, publicationThemes, publicationFormats } from "../../_content/publications";
import { PageHeader, FilterBar, StatusTag, EmptyState } from "../_ui/kit";
import MediaSlot from "../_ui/MediaSlot";

export default function ResearchV1() {
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState("");
  const filtered = publications.filter((p) => (!theme || p.theme === theme) && (!format || p.format === format));

  return (
    <>
      <PageHeader
        kicker="Research & Publications Hub"
        title="Our published and ongoing research"
        intro="Reports, working papers, briefs, explainers, infographics, videos, and data stories across PRI's research themes."
      />
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <FilterBar
          facets={[
            { label: "Theme", options: publicationThemes, value: theme, onChange: setTheme },
            { label: "Format", options: publicationFormats, value: format, onChange: setFormat },
          ]}
        />
        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState message="No publications match these filters." />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link key={p.slug} href={`/v1/research/${p.slug}`} className="block border border-[#243D9A]/12 bg-white transition-colors hover:border-[#243D9A]/40">
                {p.cover && <MediaSlot need={p.cover} />}
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-[#C9972C]">{p.format}</span>
                    <span className="text-[11px] text-[#8b8fa3]">{p.theme}</span>
                  </div>
                  <h3 className="mt-3 flex items-start gap-2 font-[family-name:var(--font-heading)] text-lg leading-snug text-[#171a2b]">
                    {p.title}
                    <StatusTag status={p.status} />
                  </h3>
                  <p className="mt-2 text-[13px] text-[#8b8fa3]">{p.authors.join(", ")} &middot; {p.date}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
