"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import type { HeroSlide } from "../../_lib/home/heroSlides";

const ADVANCE_MS = 8000;
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Slide state shared by the three layouts. Advances every 8 seconds unless the visitor paused it, is pointing at or
 * focused inside it, or prefers reduced motion (and before hydration, so the server's first slide stays put).
 */
function useSlider(count: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => true);
  const rotating = !paused && !held && !reduced && count > 1;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [rotating, index, count]);

  const go = (i: number) => setIndex((i + count) % count);
  const regionProps = {
    role: "region",
    "aria-roledescription": "carousel",
    "aria-label": "Highlights",
    onMouseEnter: () => setHeld(true),
    onMouseLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    },
  };
  return { index, go, paused, setPaused, rotating, reduced, regionProps };
}

type Tone = "dark" | "light";

function Arrow({ dir, onClick, tone }: { dir: "prev" | "next"; onClick: () => void; tone: Tone }) {
  const look = tone === "dark" ? "border-white/35 text-white hover:bg-white hover:text-[#171a2b]" : "border-[#cdd6f3] text-[#253D9A] hover:border-[#253D9A] hover:bg-[#253D9A] hover:text-white";
  return (
    <button type="button" onClick={onClick} aria-label={dir === "prev" ? "Previous slide" : "Next slide"} className={`grid h-10 w-10 place-items-center rounded-md border transition-colors ${look}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {dir === "prev" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}

function PauseButton({ paused, onToggle, tone, hidden }: { paused: boolean; onToggle: () => void; tone: Tone; hidden: boolean }) {
  if (hidden) return null;
  const look = tone === "dark" ? "border-white/35 text-white hover:bg-white hover:text-[#171a2b]" : "border-[#cdd6f3] text-[#253D9A] hover:border-[#253D9A]";
  return (
    <button type="button" onClick={onToggle} aria-label={paused ? "Play slides" : "Pause slides"} className={`grid h-10 w-10 place-items-center rounded-md border transition-colors ${look}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        {paused ? <path d="M7 4.5v15l12-7.5z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}
      </svg>
    </button>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const mono = "font-[family-name:var(--font-mono)] text-[11.5px] font-semibold uppercase tracking-[0.14em]";

/** The slide's title: the first slide's is the page's h1 (PRI's motto), the rest are h2. */
function SlideTitle({ slide, first, className }: { slide: HeroSlide; first: boolean; className: string }) {
  const Tag = first ? "h1" : "h2";
  return <Tag className={`text-balance ${className}`}>{slide.title}</Tag>;
}

function Actions({ slide, tone }: { slide: HeroSlide; tone: Tone }) {
  const primary = tone === "dark" ? "bg-white text-[#171a2b] hover:bg-[#eef1fb]" : "bg-[#253D9A] text-white hover:bg-[#1B2C70]";
  const secondary = tone === "dark" ? "border-white/40 text-white hover:border-white" : "border-[#cdd6f3] text-[#253D9A] hover:border-[#253D9A]";
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={slide.cta.href} className={`inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors ${primary}`}>
        {slide.cta.label} <span aria-hidden="true">&rarr;</span>
      </Link>
      {slide.secondary && (
        <Link href={slide.secondary.href} className={`inline-flex items-center rounded-md border px-5 py-3 text-sm font-semibold transition-colors ${secondary}`}>
          {slide.secondary.label}
        </Link>
      )}
    </div>
  );
}

/**
 * Every slide stays in the page, stacked in one grid cell so the stack is as tall as its tallest slide; only the current
 * one is visible and reachable, the others are inert.
 */
function Stack({ slides, index, className, decorative = false, children }: { slides: HeroSlide[]; index: number; className: string; decorative?: boolean; children: (slide: HeroSlide, i: number) => ReactNode }) {
  if (decorative) {
    return (
      <div aria-hidden="true" className={`grid ${className}`}>
        {slides.map((slide, i) => (
          <div key={slide.id} className={`relative [grid-area:1/1] transition-opacity duration-500 ease-out motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`}>
            {children(slide, i)}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`grid ${className}`}>
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}: ${slide.eyebrow}`}
          aria-hidden={i !== index}
          inert={i !== index}
          className={`relative [grid-area:1/1] transition-opacity duration-500 ease-out motion-reduce:transition-none ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {children(slide, i)}
        </div>
      ))}
    </div>
  );
}

function Photo({ slide, first, sizes, className = "" }: { slide: HeroSlide; first: boolean; sizes: string; className?: string }) {
  return <Image src={slide.photo.src} alt={slide.photo.alt} fill priority={first} sizes={sizes} className={`object-cover ${className}`} />;
}

function LiveStatus({ slides, index, rotating }: { slides: HeroSlide[]; index: number; rotating: boolean }) {
  return (
    <p className="sr-only" aria-live={rotating ? "off" : "polite"}>
      Slide {index + 1} of {slides.length}: {slides[index].title}
    </p>
  );
}

/** A: full-bleed photograph, navy wash, headline bottom left, numbered indicator bars. */
function OverlaySlider({ slides }: { slides: HeroSlide[] }) {
  const s = useSlider(slides.length);
  return (
    <section {...s.regionProps} className="relative bg-[#171a2b]">
      <Stack slides={slides} index={s.index} className="min-h-[560px] md:min-h-[600px]">
        {(slide, i) => (
          <>
            <Photo slide={slide} first={i === 0} sizes="100vw" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,22,52,0.88)_0%,rgba(16,22,52,0.62)_45%,rgba(16,22,52,0.15)_100%)] max-md:bg-[linear-gradient(0deg,rgba(16,22,52,0.92)_0%,rgba(16,22,52,0.7)_55%,rgba(16,22,52,0.25)_100%)]" />
            <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-28 pt-24 sm:pb-32">
              <div className="grid max-w-2xl gap-5 text-white">
                <p className={`${mono} text-[#aebbf0]`}>{slide.eyebrow}</p>
                <SlideTitle slide={slide} first={i === 0} className="text-[34px] leading-[1.06] tracking-tight sm:text-[52px]" />
                <p className="line-clamp-3 max-w-[56ch] text-pretty text-[16px] leading-relaxed text-white/80 sm:text-[17px]">{slide.text}</p>
                {slide.meta && <p className="text-[14px] font-semibold text-white">{slide.meta}</p>}
                <Actions slide={slide} tone="dark" />
              </div>
            </div>
          </>
        )}
      </Stack>
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 pb-7">
          <ol className="hidden flex-1 grid-cols-3 gap-4 sm:grid">
            {slides.map((slide, i) => (
              <li key={slide.id}>
                <button type="button" onClick={() => s.go(i)} aria-current={i === s.index} className="group grid w-full gap-2 text-left">
                  <span className={`block h-[3px] w-full transition-colors ${i === s.index ? "bg-white" : "bg-white/25 group-hover:bg-white/50"}`} />
                  <span className={`${mono} text-[10.5px] ${i === s.index ? "text-white" : "text-white/55"}`}>
                    {pad(i + 1)} {slide.eyebrow}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2">
            <span className={`${mono} mr-2 text-white/70 sm:hidden`}>
              {pad(s.index + 1)} / {pad(slides.length)}
            </span>
            <PauseButton paused={s.paused} onToggle={() => s.setPaused(!s.paused)} tone="dark" hidden={s.reduced} />
            <Arrow dir="prev" onClick={() => s.go(s.index - 1)} tone="dark" />
            <Arrow dir="next" onClick={() => s.go(s.index + 1)} tone="dark" />
          </div>
        </div>
      </div>
      <LiveStatus slides={slides} index={s.index} rotating={s.rotating} />
    </section>
  );
}

/** B: contained photograph beside a solid PRI-blue panel, with the three slides as tabs underneath. */
function SplitSlider({ slides }: { slides: HeroSlide[] }) {
  const s = useSlider(slides.length);
  return (
    <section {...s.regionProps} className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
      <Stack slides={slides} index={s.index} className="overflow-hidden rounded-lg md:min-h-[480px]">
        {(slide, i) => (
          <div className="grid h-full md:grid-cols-[1.55fr_1fr]">
            <div className="relative min-h-[240px] sm:min-h-[320px]">
              <Photo slide={slide} first={i === 0} sizes="(min-width: 768px) 700px, 100vw" />
            </div>
            <div className="flex flex-col justify-center gap-5 bg-[#253D9A] p-7 text-white sm:p-10">
              <p className={`${mono} text-[#c9d3fb]`}>{slide.eyebrow}</p>
              <SlideTitle slide={slide} first={i === 0} className="text-[28px] leading-[1.1] tracking-tight sm:text-[34px]" />
              <p className="line-clamp-4 text-pretty text-[15.5px] leading-relaxed text-white/80">{slide.text}</p>
              {slide.meta && <p className="text-[14px] font-semibold">{slide.meta}</p>}
              <Actions slide={slide} tone="dark" />
            </div>
          </div>
        )}
      </Stack>
      <div className="mt-px flex items-stretch border-b border-[#e3e6f0]">
        <ol className="grid flex-1 grid-cols-3">
          {slides.map((slide, i) => (
            <li key={slide.id} className="min-w-0">
              <button
                type="button"
                onClick={() => s.go(i)}
                aria-current={i === s.index}
                className={`grid h-full w-full gap-1 border-t-[3px] px-1 py-4 text-left transition-colors sm:px-4 ${i === s.index ? "border-[#253D9A]" : "border-transparent hover:border-[#cdd6f3]"}`}
              >
                <span className={`${mono} text-[10.5px] ${i === s.index ? "text-[#253D9A]" : "text-[#8b8fa3]"}`}>{pad(i + 1)}</span>
                <span className="hidden sm:block">
                  <span className={`line-clamp-2 text-[14px] font-semibold leading-snug ${i === s.index ? "text-[#171a2b]" : "text-[#5b6280]"}`}>{slide.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2 pl-3">
          <PauseButton paused={s.paused} onToggle={() => s.setPaused(!s.paused)} tone="light" hidden={s.reduced} />
          <Arrow dir="prev" onClick={() => s.go(s.index - 1)} tone="light" />
          <Arrow dir="next" onClick={() => s.go(s.index + 1)} tone="light" />
        </div>
      </div>
      <LiveStatus slides={slides} index={s.index} rotating={s.rotating} />
    </section>
  );
}

/** C: wide photograph with a white caption card overlapping its lower edge. */
function CaptionSlider({ slides }: { slides: HeroSlide[] }) {
  const s = useSlider(slides.length);
  return (
    <section {...s.regionProps} className="relative">
      <Stack slides={slides} index={s.index} decorative className="h-[300px] sm:h-[420px] lg:h-[500px]">
        {(slide, i) => <Photo slide={slide} first={i === 0} sizes="100vw" />}
      </Stack>
      <div className="relative mx-auto -mt-20 max-w-6xl px-4 sm:-mt-28 sm:px-6">
        <div className="rounded-lg border border-[#e3e6f0] bg-white shadow-[0_24px_48px_-28px_rgba(23,26,43,0.45)]">
          <Stack slides={slides} index={s.index} className="">
            {(slide, i) => (
              <div className="grid content-start gap-4 p-6 sm:p-10">
                <p className={`flex items-center gap-2.5 ${mono} text-[#253D9A]`}>
                  <span aria-hidden="true" className="h-2 w-2 bg-[#253D9A]" />
                  {slide.eyebrow}
                </p>
                <SlideTitle slide={slide} first={i === 0} className="max-w-[30ch] text-[26px] leading-[1.1] tracking-tight text-[#171a2b] sm:text-[34px]" />
                <p className="line-clamp-3 max-w-[70ch] text-pretty text-[15.5px] leading-relaxed text-[#4b4f66]">{slide.text}</p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Actions slide={slide} tone="light" />
                  {slide.meta && <p className="text-[14px] font-semibold text-[#171a2b]">{slide.meta}</p>}
                </div>
              </div>
            )}
          </Stack>
          <div className="flex items-center justify-between gap-4 border-t border-[#e3e6f0] px-6 py-3 sm:px-10">
            <ol className="flex gap-2">
              {slides.map((slide, i) => (
                <li key={slide.id}>
                  <button type="button" onClick={() => s.go(i)} aria-current={i === s.index} aria-label={`Show slide ${i + 1}: ${slide.eyebrow}`} className="grid h-10 place-items-center px-1">
                    <span className={`block h-1.5 rounded-full transition-[width,background-color] ${i === s.index ? "w-8 bg-[#253D9A]" : "w-4 bg-[#cdd6f3] hover:bg-[#9fb0e6]"}`} />
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-2">
              <span className={`${mono} mr-2 hidden text-[#8b8fa3] sm:inline`}>
                {pad(s.index + 1)} / {pad(slides.length)}
              </span>
              <PauseButton paused={s.paused} onToggle={() => s.setPaused(!s.paused)} tone="light" hidden={s.reduced} />
              <Arrow dir="prev" onClick={() => s.go(s.index - 1)} tone="light" />
              <Arrow dir="next" onClick={() => s.go(s.index + 1)} tone="light" />
            </div>
          </div>
        </div>
      </div>
      <LiveStatus slides={slides} index={s.index} rotating={s.rotating} />
    </section>
  );
}

/** The homepage's three photo slides, in one of three layouts (the redesign's alternatives A, B and C). */
export default function HomeSlider({ slides, layout }: { slides: HeroSlide[]; layout: "overlay" | "split" | "caption" }) {
  if (layout === "split") return <SplitSlider slides={slides} />;
  if (layout === "caption") return <CaptionSlider slides={slides} />;
  return <OverlaySlider slides={slides} />;
}
