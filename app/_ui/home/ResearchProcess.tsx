"use client";

import { useEffect, useState } from "react";

export type ProcessStep = { title: string; detail: string };

const STEP_MS = 900;
/** Pause with every step lit before the sequence starts over. */
const HOLD_STEPS = 3;

/**
 * How a PRI study is made, as a strip of steps that light up one after another and loop. Rendered fully lit, so it
 * reads complete without JavaScript and in a still capture; the sequence only runs in view and not under reduced
 * motion.
 */
export default function ResearchProcess({ steps }: { steps: ProcessStep[] }) {
  // Number of lit steps; `null` means "all lit" (the resting state).
  const [lit, setLit] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tick = 0;
    const timer = window.setInterval(() => {
      tick = (tick + 1) % (steps.length + HOLD_STEPS);
      setLit(tick);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [steps.length]);

  const isOn = (i: number) => lit === null || lit === 0 || i < lit;

  return (
    <ol className="grid gap-4 md:grid-cols-7 md:gap-0">
      {steps.map((step, i) => {
        const on = isOn(i);
        const lineOn = lit === null || lit === 0 || i + 1 < lit;
        return (
          <li key={step.title} className="relative grid grid-cols-[28px_1fr] content-start items-start gap-x-3 md:grid-cols-1 md:justify-items-center md:gap-3 md:px-2 md:text-center">
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-1/2 right-[-50%] top-[13px] hidden h-[2px] bg-[#e3e6f0] md:block">
                <span className={`block h-full bg-[#253D9A] transition-[width] duration-500 ${lineOn ? "w-full" : "w-0"}`} />
              </span>
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold transition-all duration-300 ${
                on ? "scale-110 border-[#253D9A] bg-[#253D9A] text-white" : "border-[#d9ddea] bg-white text-[#8b93b3]"
              }`}
            >
              {i + 1}
            </span>
            <div className="grid gap-1">
              <p className={`font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${on ? "text-[#171a2b]" : "text-[#8b93b3]"}`}>
                {step.title}
              </p>
              <p className={`text-[13px] leading-snug text-[#5b6280] transition-opacity duration-500 ${on ? "opacity-100" : "opacity-40"}`}>{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
