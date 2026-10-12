"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaNeed } from "../../_lib/types";

/**
 * An event's photos as a grid; a click opens a full-screen viewer on a native <dialog> (focus trapped, Esc closes),
 * with previous/next buttons, arrow keys and the caption. Each thumbnail is a button, so it works by keyboard.
 */
export default function EventGallery({ photos, title }: { photos: MediaNeed[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const count = photos.length;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const step = useCallback((by: number) => setIndex((i) => (i === null ? i : (i + by + count) % count)), [count]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [step]);

  if (count === 0) return null;
  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => {
          // With three or more photos the first one leads, two columns wide and two rows tall.
          const lead = i === 0 && count > 2;
          return (
          <li key={photo.src ?? i} className={lead ? "col-span-2 row-span-2" : ""}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Open photo ${i + 1} of ${count}: ${photo.label}`}
              className={`group relative block w-full overflow-hidden ${lead ? "aspect-[4/3] sm:aspect-auto sm:h-full" : "aspect-[4/3]"} rounded-lg bg-[#eceef5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#253D9A] focus-visible:ring-offset-2`}
            >
              <Image
                src={photo.src ?? ""}
                alt=""
                fill
                sizes={lead ? "(max-width: 640px) 100vw, 560px" : "(max-width: 640px) 50vw, 280px"}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        aria-label={`${title}: photos`}
        className="m-auto h-[92vh] max-h-none w-[min(1100px,96vw)] max-w-none bg-transparent p-0 backdrop:bg-[#0d1024]/90"
      >
        {current && (
          <figure className="flex h-full flex-col">
            <div className="relative min-h-0 flex-1">
              <Image src={current.src ?? ""} alt={current.label} fill sizes="96vw" className="object-contain" />
            </div>
            <figcaption className="flex items-center justify-between gap-4 pt-4 text-white">
              <span className="min-w-0 text-[14px] leading-snug text-white/85">{current.label}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-[family-name:var(--font-mono)] text-[12px] tracking-[0.1em] text-white/60">
                  {String((index ?? 0) + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
                {count > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="rounded-md border border-white/25 px-3 py-1.5 text-[15px] hover:bg-white/10">
                      &larr;
                    </button>
                    <button type="button" onClick={() => step(1)} aria-label="Next photo" className="rounded-md border border-white/25 px-3 py-1.5 text-[15px] hover:bg-white/10">
                      &rarr;
                    </button>
                  </>
                )}
                <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-md bg-white px-3 py-1.5 text-[13px] font-semibold text-[#171a2b] hover:bg-white/90">
                  Close
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
