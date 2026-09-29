import Image from "next/image";
import type { MediaNeed } from "../_lib/types";
import { stockPhotoFor } from "../_lib/stockPhotos";

const ratioClasses: Record<string, string> = {
  square: "aspect-square",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "3:4": "aspect-[3/4]",
};

const ratioClass = (ratio: string) => ratioClasses[ratio] ?? "aspect-video";

const kindLabel: Record<MediaNeed["kind"], string> = {
  photo: "Photograph",
  logo: "Logo",
  chart: "Chart",
  map: "Map",
  video: "Video",
  diagram: "Diagram",
  document: "Document",
};

/** Renders wherever a photo/logo/chart/map/video/diagram is required but PRI hasn't supplied it. */
export default function MediaSlot({ need, className = "" }: { need: MediaNeed; className?: string }) {
  const photoUrl = need.src ?? stockPhotoFor(need);

  if (photoUrl) {
    const fit = need.kind === "logo" ? "object-contain p-3" : "object-cover";
    return (
      <div className={`relative ${ratioClass(need.ratio)} overflow-hidden rounded-lg ${className}`}>
        <Image src={photoUrl} alt={need.label} fill sizes="(max-width: 768px) 100vw, 400px" className={fit} />
        {!need.src && (
          <span className="absolute bottom-2 right-2 rounded bg-black/45 px-2 py-0.5 text-[9px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.08em] text-white/85">
            Stock photo — placeholder
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex ${ratioClass(need.ratio)} flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#E4633F]/30 bg-white p-4 text-center ${className}`}
    >
      <span className="rounded bg-[#E4633F]/10 px-2 py-0.5 text-[10px] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.08em] text-[#E4633F]">
        {kindLabel[need.kind]} needed
      </span>
      <span className="max-w-[85%] text-[13px] leading-snug text-[#5b5f74]">{need.label}</span>
      <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#8b8fa3]">{need.ratio}</span>
    </div>
  );
}
