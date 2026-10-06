"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MENTION_KIND_LABELS, type Mention, type MentionKind } from "../_lib/api/impactAdapter";

type Cited = { href: string; title: string };

/** The tag on one card (singular); the filter pills use the plural `MENTION_KIND_LABELS`. */
const KIND_TAG: Record<MentionKind, string> = { news: "News", research: "Research paper", report: "Report", legislature: "Legislature", other: "Other" };

/** Mentions with kind filter pills; each card links out to the source and back to the PRI work it cites. */
export default function MentionList({ mentions, cited }: { mentions: Mention[]; cited: Record<string, Cited> }) {
  const [kind, setKind] = useState<MentionKind | "all">("all");
  const kinds = (Object.keys(MENTION_KIND_LABELS) as MentionKind[]).filter((k) => mentions.some((m) => m.kind === k));
  const shown = kind === "all" ? mentions : mentions.filter((m) => m.kind === kind);

  return (
    <div>
      {kinds.length > 1 && (
        <div role="group" aria-label="Filter by kind" className="mb-8 flex flex-wrap gap-2">
          {(["all", ...kinds] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`rounded-md border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                kind === k ? "border-[#253D9A] bg-[#253D9A] text-white" : "border-[#d9ddea] bg-white text-[#3a4263] hover:border-[#253D9A] hover:text-[#253D9A]"
              }`}
            >
              {k === "all" ? "All" : MENTION_KIND_LABELS[k]}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-5 md:grid-cols-2">
        {shown.map((m) => {
          const works = [m.publicationSlug && cited[`p:${m.publicationSlug}`], m.datasetSlug && cited[`d:${m.datasetSlug}`]].filter(
            (w): w is Cited => Boolean(w),
          );
          return (
            <li key={m.slug} className="group flex flex-col rounded-lg border border-[#e3e6f0] bg-white p-6 transition-[border-color,box-shadow] hover:border-[#cdd6f3] hover:shadow-[0_12px_28px_-16px_rgba(23,26,43,0.35)]">
              <div className="flex items-center justify-between gap-4">
                {m.logo ? (
                  <span className="relative block h-9 w-32">
                    <Image src={m.logo} alt={m.publisher} fill sizes="128px" className="object-contain object-left opacity-70 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
                  </span>
                ) : (
                  <span className="font-[family-name:var(--font-heading)] text-[16px] text-[#3a4263]">{m.publisher}</span>
                )}
                <span className="shrink-0 rounded bg-[#253D9A]/8 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#253D9A]">
                  {KIND_TAG[m.kind]}
                </span>
              </div>
              <h2 className="mt-4 text-[18px] leading-snug text-[#171a2b]">{m.title}</h2>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-[12px] text-[#6f7899]">
                {m.logo && <>{m.publisher} · </>}
                {m.dateLabel}
              </p>
              {m.summary && <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-[#4b4f66]">{m.summary}</p>}
              {works.length > 0 && (
                <p className="mt-4 text-[13px] text-[#5b6280]">
                  Cites{" "}
                  {works.map((w, i) => (
                    <span key={w.href}>
                      {i > 0 && " and "}
                      <Link href={w.href} className="font-semibold text-[#253D9A] hover:underline">
                        {w.title}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-fit items-center gap-1 text-[13.5px] font-semibold text-[#253D9A] hover:underline">
                Read at the source <span aria-hidden="true">&#8599;</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
