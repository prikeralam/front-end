import type { ReactNode } from "react";

/** Colour families built from PRI blue plus one partner hue each, so every project gets its own but they read as a set. */
const PALETTES = [
  "radial-gradient(45% 55% at 22% 30%, rgba(37,61,154,.85), transparent 68%), radial-gradient(50% 60% at 80% 20%, rgba(94,125,230,.7), transparent 70%), radial-gradient(55% 60% at 60% 90%, rgba(201,151,44,.55), transparent 72%)",
  "radial-gradient(50% 60% at 14% 60%, rgba(228,99,63,.6), transparent 70%), radial-gradient(46% 55% at 84% 76%, rgba(37,61,154,.85), transparent 68%), radial-gradient(55% 55% at 62% 8%, rgba(160,180,255,.8), transparent 72%)",
  "radial-gradient(48% 58% at 80% 22%, rgba(23,26,43,.55), transparent 70%), radial-gradient(46% 58% at 22% 52%, rgba(37,61,154,.85), transparent 68%), radial-gradient(55% 58% at 66% 92%, rgba(120,200,170,.6), transparent 72%)",
  "radial-gradient(50% 60% at 18% 82%, rgba(37,61,154,.8), transparent 70%), radial-gradient(48% 56% at 82% 22%, rgba(120,90,200,.55), transparent 68%), radial-gradient(40% 48% at 62% 62%, rgba(94,125,230,.7), transparent 64%)",
];

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Pictograms for the known projects; anything else gets a generic "study" mark. */
const GLYPHS: Record<string, ReactNode> = {
  education: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" {...stroke} />
      <path d="M6 11v5c3 2 9 2 12 0v-5" {...stroke} />
    </>
  ),
  "demography-migration": (
    <>
      <path d="M4 18h16M4 18l4-4M20 18l-4-4" {...stroke} />
      <circle cx="8" cy="7" r="2.5" {...stroke} />
      <circle cx="16" cy="7" r="2.5" {...stroke} />
    </>
  ),
  "sir-project": (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" {...stroke} />
      <path d="M8 8h8M8 12h8M8 16h5" {...stroke} />
    </>
  ),
};
const FALLBACK_GLYPH = (
  <>
    <circle cx="11" cy="11" r="6" {...stroke} />
    <path d="m15.5 15.5 4.5 4.5" {...stroke} />
  </>
);

/** A slowly drifting gradient with fine grain and a pictogram, standing in for a photo on project cards. */
export default function ThemePanel({ slug, index }: { slug: string; index: number }) {
  return (
    <div className="pri-motion relative aspect-[16/9] overflow-hidden bg-[#eef1f9]">
      <div
        className="absolute inset-[-22%] animate-[pri-drift_16s_ease-in-out_infinite_alternate] blur-[28px] saturate-[1.1] transition-[filter] duration-500 group-hover:saturate-150"
        style={{ backgroundImage: PALETTES[index % PALETTES.length], animationDelay: `${index * -4}s` }}
      />
      <div className="pri-grain absolute inset-0 opacity-30 mix-blend-overlay" />
      <div className="absolute inset-0 m-auto grid h-14 w-14 place-items-center rounded-lg bg-white/90 text-[#253D9A] shadow-[0_8px_20px_-10px_rgba(23,26,43,0.45)] backdrop-blur transition-transform duration-500 group-hover:scale-105">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          {GLYPHS[slug] ?? FALLBACK_GLYPH}
        </svg>
      </div>
    </div>
  );
}
