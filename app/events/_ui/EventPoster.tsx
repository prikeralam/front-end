import Image from "next/image";
import type { MediaNeed } from "../../_lib/types";

/**
 * An event's cover. On a card it fills the frame edge to edge, trimmed from the bottom so a poster's title (usually at
 * the top) stays. On the event page it keeps its own shape at the column's full width: nothing is cut and nothing
 * pads its sides, so a portrait poster is simply tall.
 */
export default function EventPoster({ image, card = false }: { image: MediaNeed; card?: boolean }) {
  if (!image.src) return null;
  if (card) {
    return (
      <div className="relative aspect-video overflow-hidden bg-[#eceef5]">
        <Image src={image.src} alt={image.label} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
      </div>
    );
  }
  return (
    <Image
      src={image.src}
      alt={image.label}
      width={0}
      height={0}
      priority
      sizes="(min-width: 1152px) 730px, 100vw"
      className="h-auto w-full rounded-lg bg-[#eceef5]"
    />
  );
}
