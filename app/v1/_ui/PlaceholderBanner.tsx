import { ratioClass } from "../../_lib/ratio";

/**
 * Documentary-style abstract placeholder standing in for a real project
 * photograph. Duotone indigo/amber so it reads as an intentional visual,
 * not a broken image — swap for real photography later.
 */
export default function PlaceholderBanner({
  caption,
  ratio = "3:2",
  seed = 1,
}: {
  caption: string;
  ratio?: string;
  seed?: number;
}) {
  const bands = [0, 1, 2, 3, 4].map((i) => (i + seed) % 5);
  return (
    <div className={`relative ${ratioClass(ratio)} overflow-hidden bg-[#1c2456]`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect width="400" height="300" fill="#1c2456" />
        {bands.map((b, i) => (
          <rect key={i} x={i * 80} y="0" width="80" height="300" fill={b % 2 === 0 ? "#2e3891" : "#232c6e"} />
        ))}
        <circle cx={80 + seed * 40} cy="150" r="90" fill="#C9972C" opacity="0.18" />
        <circle cx={320 - seed * 30} cy="90" r="50" fill="#ffffff" opacity="0.08" />
      </svg>
      <span className="absolute left-3 top-3 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80">
        Placeholder image
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 font-[family-name:var(--font-heading)] text-[15px] italic text-white">
        {caption}
      </span>
    </div>
  );
}
