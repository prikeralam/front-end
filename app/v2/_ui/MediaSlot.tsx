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
      <div className={`relative ${ratioClass(need.ratio)} overflow-hidden rounded-xl ${className}`}>
        <Image src={photoUrl} alt={need.label} fill sizes="(max-width: 768px) 100vw, 400px" className={fit} />
        {!need.src && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/85">
            Stock photo — placeholder
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex ${ratioClass(need.ratio)} flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#E4633F]/30 bg-[#fafbfc] p-4 text-center ${className}`}
    >
      <span className="rounded-full bg-[#E4633F]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E4633F]">
        {kindLabel[need.kind]} needed
      </span>
      <span className="max-w-[85%] text-[13px] leading-snug text-[#5b5f74]">{need.label}</span>
      <span className="font-[family-name:var(--font-mono)] text-[11px] text-[#8b8fa3]">{need.ratio}</span>
    </div>
  );
}
