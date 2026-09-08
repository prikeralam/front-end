import Image from "next/image";
import type { MediaNeed } from "../../_lib/types";
import { ratioClass } from "../../_lib/ratio";
import { stockPhotoFor } from "../../_lib/stockPhotos";

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
      <div className={`relative ${ratioClass(need.ratio)} overflow-hidden border border-[#e6dbc7] ${className}`}>
        <Image src={photoUrl} alt={need.label} fill className={fit} sizes="(min-width: 1024px) 400px, 100vw" />
        {!need.src && (
          <span className="absolute bottom-2 right-2 bg-black/45 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/85">
            Stock photo — placeholder
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex ${ratioClass(need.ratio)} flex-col items-center justify-center gap-2 border border-dashed border-[#243D9A]/30 bg-[#F1E9D8] p-4 text-center ${className}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B8862F]">
        {kindLabel[need.kind]} needed
      </span>
      <span className="max-w-[85%] text-[13px] leading-snug text-[#5b5f74]">{need.label}</span>
      <span className="text-[11px] text-[#8b8fa3]">{need.ratio}</span>
    </div>
  );
}
