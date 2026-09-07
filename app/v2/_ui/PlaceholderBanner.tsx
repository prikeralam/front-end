import { ratioClass } from "../../_lib/ratio";

/**
 * Data-driven abstract placeholder standing in for a real project photo —
 * an abstract bar-chart/dot-grid pattern in indigo/emerald so it reads as an
 * intentional visual, not a broken image. Swap for real photography later.
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
  const bars = Array.from({ length: 8 }, (_, i) => 40 + ((i * 37 + seed * 53) % 180));
  const dots = Array.from({ length: 18 }, (_, i) => ({
    cx: 20 + ((i * 41 + seed * 17) % 360),
    cy: 20 + ((i * 29 + seed * 11) % 260),
    r: 3 + ((i + seed) % 4),
  }));

  return (
    <div className={`relative ${ratioClass(ratio)} overflow-hidden rounded-xl bg-[#12142b]`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect width="400" height="300" fill="#12142b" />
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#E4633F" opacity="0.25" />
        ))}
        {bars.map((h, i) => (
          <rect key={i} x={20 + i * 46} y={280 - h} width="28" height={h} rx="4" fill={i % 3 === 0 ? "#E4633F" : "#0F6B5C"} opacity="0.85" />
        ))}
      </svg>
      <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/85">
        Placeholder image
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-[15px] font-semibold text-white">
        {caption}
      </span>
    </div>
  );
}
