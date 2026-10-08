import Image from "next/image";
import type { CSSProperties } from "react";

type Lane = { themes: string[]; radius: string; seconds: number; offset: number; reverse?: boolean };

/**
 * PRI's research themes circling the PRI mark on two rings that turn in opposite directions. Pure CSS: the chips
 * stay upright while their lane rotates, and everything stands still under reduced motion. Decorative, so hidden
 * from assistive technology; the themes are listed in words elsewhere on the page.
 */
export default function ThemeOrbit({ themes }: { themes: string[] }) {
  const outerCount = Math.ceil(themes.length * 0.6);
  const lanes: Lane[] = [
    { themes: themes.slice(0, outerCount), radius: "40cqw", seconds: 90, offset: 0 },
    { themes: themes.slice(outerCount), radius: "27cqw", seconds: 55, offset: 30, reverse: true },
  ];

  return (
    <div aria-hidden="true" className="pri-motion @container relative mx-auto aspect-square w-full max-w-[460px] animate-[pri-rise_900ms_cubic-bezier(.22,1,.36,1)_300ms_both]">
      <div className="absolute inset-[4%] animate-[pri-spin_60s_linear_infinite] rounded-full border border-dashed border-[#cdd6f3]" />
      <div className="absolute inset-[22%] animate-[pri-spin_45s_linear_infinite_reverse] rounded-full border border-dashed border-[#cdd6f3]" />
      <div className="absolute inset-[38%] rounded-full border border-[#e3e6f0]" />
      <div className="absolute inset-[39.5%] grid place-items-center rounded-full bg-white shadow-[0_0_0_12px_rgba(37,61,154,0.07),0_12px_32px_-12px_rgba(23,26,43,0.3)]">
        <Image src="/logo.png" alt="Policy and Research Initiative logo" width={64} height={64} className="h-[58%] w-[58%] object-contain" priority />
      </div>

      {lanes.map((lane) => (
        <div
          key={lane.radius}
          className="absolute inset-0"
          style={{ animation: `pri-spin ${lane.seconds}s linear infinite${lane.reverse ? " reverse" : ""}` }}
        >
          {lane.themes.map((theme, i) => {
            const angle = (360 / lane.themes.length) * i + lane.offset;
            return (
              <div
                key={theme}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `rotate(${angle}deg) translateX(${lane.radius}) rotate(${-angle}deg)` } as CSSProperties}
              >
                <span
                  className="inline-block whitespace-nowrap rounded-md border border-[#e3e6f0] bg-white px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] sm:px-2.5 sm:py-1.5 sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-[#253D9A] shadow-[0_6px_16px_-8px_rgba(23,26,43,0.35)]"
                  style={{ animation: `pri-unspin ${lane.seconds}s linear infinite${lane.reverse ? " reverse" : ""}`, transform: "translate(-50%, -50%)" }}
                >
                  {theme}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
