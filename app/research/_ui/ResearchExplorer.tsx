"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPublicationDate } from "../../_lib/api/publicationAdapter";
import type { Person, Publication } from "../../_lib/types";
import { FilterBar, StatusTag, EmptyState } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";
import Byline from "./Byline";

const sortOptions = ["Latest", "Most read"];

const distinct = (values: string[]) => [...new Set(values)];

/** Filterable, sortable grid of publications. Filtering is client-side over the full published list. */
export default function ResearchExplorer({ publications, authors }: { publications: Publication[]; authors: Record<string, Person> }) {
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState(sortOptions[0]);

  const themeOptions = useMemo(() => distinct(publications.map((p) => p.theme)), [publications]);
  const formatOptions = useMemo(() => distinct(publications.map((p) => p.format)), [publications]);
  const languageOptions = useMemo(() => distinct(publications.map((p) => p.language)), [publications]);

  const filtered = useMemo(() => {
    const list = publications.filter(
      (p) => (!theme || p.theme === theme) && (!format || p.format === format) && (!language || p.language === language),
    );
    return [...list].sort((a, b) => (sort === "Most read" ? b.views - a.views : b.date.localeCompare(a.date)));
  }, [publications, theme, format, language, sort]);

  return (
    <>
      <FilterBar
        facets={[
          { label: "Theme", options: themeOptions, value: theme, onChange: setTheme },
          { label: "Format", options: formatOptions, value: format, onChange: setFormat },
          { label: "Language", options: languageOptions, value: language, onChange: setLanguage },
          { label: "Sort by", options: sortOptions, value: sort, onChange: setSort },
        ]}
      />
      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState message="No publications match these filters." />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const people = p.authors.map((slug) => authors[slug]).filter(Boolean);
            return (
              <Link key={p.slug} href={`/research/${p.slug}`} className="group overflow-hidden rounded-lg border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(23,26,43,0.10)]">
                {p.cover && <MediaSlot need={p.cover} />}
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#253D9A]/8 px-2 py-0.5 text-[11px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.08em] text-[#253D9A]">{p.format}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8b8fa3]">{p.theme}</span>
                    <span className="text-[11px] text-[#8b8fa3]">&middot; {p.language}</span>
                  </div>
                  <h3 className="mt-3 flex items-start gap-2 text-lg font-bold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">
                    {p.title}
                    <StatusTag status={p.status} />
                  </h3>
                  <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#8b8fa3]">
                    <Byline people={people} />
                    {people.length > 0 && <span aria-hidden="true">&middot;</span>}
                    {formatPublicationDate(p.date)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
