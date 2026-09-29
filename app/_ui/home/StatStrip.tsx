"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type Stat = { value: number; label: string; href: string };

/**
 * Headline counts from the API. The real numbers are rendered on the server, so the strip is complete without
 * JavaScript; when it first scrolls into view the numbers count up from zero once. Not under reduced motion.
 */
export default function StatStrip({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    let frame = 0;
    let settle = 0;
    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    const showFinal = () => {
      for (const cell of cells) cell.textContent = cell.dataset.count ?? "";
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || document.visibilityState !== "visible") return;
        observer.disconnect();
        // Animation frames pause in background tabs; whatever happens, land on the real numbers.
        settle = window.setTimeout(showFinal, 1500);
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1200);
          const eased = 1 - Math.pow(1 - progress, 3);
          for (const cell of cells) cell.textContent = String(Math.round(Number(cell.dataset.count) * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      showFinal();
    };
  }, []);

  return (
    <ul ref={ref} className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#e3e6f0] bg-white sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <li key={s.label} className="border-b border-r border-[#e3e6f0] lg:border-b-0 [&:last-child]:border-r-0">
          <Link href={s.href} className="group flex h-full flex-col gap-1.5 px-5 py-5 transition-colors hover:bg-[#f7f8fc]">
            <span data-count={s.value} className="font-[family-name:var(--font-mono)] text-[32px] font-semibold leading-none tabular-nums text-[#253D9A]">
              {s.value}
            </span>
            <span className="text-[13.5px] text-[#4b4f66] group-hover:text-[#253D9A]">{s.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
