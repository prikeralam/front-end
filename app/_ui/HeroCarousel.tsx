"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroProject } from "../_content/projects";

export default function HeroCarousel({ projects, photos }: { projects: HeroProject[]; photos: Record<string, string> }) {
  const [index, setIndex] = useState(0);
  const go = (i: number) => setIndex((i + projects.length) % projects.length);

  return (
    <section className="relative w-full aspect-[3/2] min-h-[320px] max-h-[520px] overflow-hidden">
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {projects.map((p, i) => (
          <Link
            key={p.slug}
            href={p.ctaHref ?? `/v2/projects/${p.slug}`}
            className="group relative block h-full w-full shrink-0 overflow-hidden"
          >
            <Image
              src={photos[p.slug]}
              alt={p.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-12">
              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl">{p.title}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{p.blurb}</p>
              <span className="mt-5 inline-block rounded-full bg-[#E4633F] px-5 py-2.5 text-sm font-semibold text-white">
                {p.ctaLabel ?? "Explore project"} &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous project"
        onClick={() => go(index - 1)}
        className="absolute left-3 top-[38%] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:left-5"
      >
        &larr;
      </button>
      <button
        type="button"
        aria-label="Next project"
        onClick={() => go(index + 1)}
        className="absolute right-3 top-[38%] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:right-5"
      >
        &rarr;
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {projects.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            aria-label={`Go to ${p.title}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-7 bg-[#E4633F]" : "w-3 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
