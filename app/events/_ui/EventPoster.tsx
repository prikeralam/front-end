import Image from "next/image";
import type { MediaNeed } from "../../_lib/types";

/**
 * The event's cover, shown whole: most are posters (often portrait), so the image is fitted, never cropped, over a
 * blurred and dimmed copy of itself that fills the frame.
 */
export default function EventPoster({ image, card = false }: { image: MediaNeed; card?: boolean }) {
  if (!image.src) return null;
  const frame = card ? "aspect-video" : "h-[clamp(260px,68vw,560px)] rounded-lg";
  return (
    <div className={`relative overflow-hidden bg-[#171a2b] ${frame}`}>
      <Image src={image.src} alt="" aria-hidden="true" fill sizes={card ? "200px" : "100vw"} className="scale-110 object-cover opacity-55 blur-2xl" />
      <Image
        src={image.src}
        alt={image.label}
        fill
        priority={!card}
        sizes={card ? "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" : "(min-width: 1152px) 1104px, 100vw"}
        className={`object-contain ${card ? "p-2" : "p-3 sm:p-5"}`}
      />
    </div>
  );
}
