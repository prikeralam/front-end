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
  const photo = need.src ?? stockPhotoFor(need);
  if (photo) {
    const fit = need.kind === "logo" ? "object-contain p-3" : "object-cover";
    return (
      <div className={`relative ${ratioClass(need.ratio)} overflow-hidden ${className}`}>
        <Image src={photo} alt={need.label} fill sizes="(max-width: 768px) 100vw, 400px" className={fit} />
        {!need.src && (
          <span className="absolute bottom-2 left-2 bg-black/40 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-white/80">
            Stock photo — placeholder
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex ${ratioClass(need.ratio)} flex-col items-center justify-center gap-2 border border-dashed border-[#253D9A]/30 bg-[#f7f7f3] p-4 text-center ${className}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#C9972C]">
        {kindLabel[need.kind]} needed
      </span>
      <span className="max-w-[85%] text-[13px] leading-snug text-[#5b5f74]">{need.label}</span>
      <span className="text-[11px] text-[#8b8fa3]">{need.ratio}</span>
    </div>
  );
}
