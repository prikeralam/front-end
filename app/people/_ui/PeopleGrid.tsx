"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { Person } from "../../_lib/types";
import { isPlainClick } from "./plainClick";
import ProfileLinks from "./ProfileLinks";

/** Shown where PRI hasn't supplied a portrait yet: a quiet silhouette rather than a stranger's stock photo. */
function PortraitPlaceholder() {
  return (
    <div className="flex h-full w-full items-end justify-center bg-[#eef0f5]">
      <svg viewBox="0 0 100 100" aria-hidden="true" className="h-[78%] w-[78%] text-[#d3d8e6]">
        <circle cx="50" cy="38" r="19" fill="currentColor" />
        <path d="M12 100c2-24 18-38 38-38s36 14 38 38z" fill="currentColor" />
      </svg>
    </div>
  );
}

function Portrait({ person, sizes, className = "" }: { person: Person; sizes: string; className?: string }) {
  const src = person.photo?.src;
  return src ? (
    <Image src={src} alt={`Portrait of ${person.name}`} fill sizes={sizes} className={`object-cover ${className}`} />
  ) : (
    <PortraitPlaceholder />
  );
}

/**
 * The public grid for one people group. Portraits are black and white until hovered or focused, so photos taken in
 * different light still read as one set. A card is a real link to the profile page (new tab, no-JS and sharing keep
 * working); a plain click opens the profile in a pop-up instead.
 */
export default function PeopleGrid({ people, groupLabel }: { people: Person[]; groupLabel: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Person | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>, person: Person) {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    setOpen(person);
  }

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {people.map((p) => (
          <li key={p.slug} className="flex">
            {/* The card holds two links and the contact icons side by side: interactive elements can't nest in one link. */}
            <div className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-[#e3e6f0] bg-white transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-[2px] before:origin-left before:scale-x-0 before:bg-[#253D9A] before:transition-transform before:duration-[350ms] before:ease-[cubic-bezier(.22,1,.36,1)] hover:border-[#cdd6f3] hover:shadow-[0_14px_30px_-18px_rgba(23,26,43,0.45)] hover:before:scale-x-100 focus-within:before:scale-x-100 motion-reduce:transition-none motion-reduce:before:transition-none">
              <Link
                href={`/people/${p.slug}`}
                onClick={(e) => handleClick(e, p)}
                aria-haspopup="dialog"
                className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#253D9A]"
              >
                <div className="relative aspect-square overflow-hidden border-b border-[#e3e6f0] bg-[#eef0f5]">
                  <Portrait
                    person={p}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                    className="grayscale transition-[filter,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03] group-hover:grayscale-0 group-focus-within:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 px-3 pt-3.5 sm:px-4">
                  <p className="font-[family-name:var(--font-heading)] text-[16px] leading-snug text-[#171a2b] transition-colors group-hover:text-[#253D9A]">{p.name}</p>
                  {p.role && <p className="font-[family-name:var(--font-mono)] text-[10.5px] uppercase leading-snug tracking-[0.08em] text-[#6f7899]">{p.role}</p>}
                </div>
              </Link>
              {/* Icons on the left, "Read profile" bottom right; on narrow cards the link wraps onto its own line. */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 pb-3 pt-2 sm:px-4">
                <ProfileLinks person={p} share={false} />
                <Link
                  href={`/people/${p.slug}`}
                  onClick={(e) => handleClick(e, p)}
                  aria-haspopup="dialog"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="ml-auto inline-flex min-h-8 items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-[#253D9A]"
                >
                  Read profile
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        aria-labelledby="person-dialog-name"
        className="m-auto w-[min(760px,calc(100%-32px))] max-h-[min(86vh,640px)] overflow-hidden rounded-lg border-0 bg-white p-0 text-[#22263a] shadow-[0_30px_80px_-20px_rgba(15,18,32,0.55)] backdrop:bg-[#0f1220]/60 open:animate-[person-rise_320ms_cubic-bezier(.22,1,.36,1)] motion-reduce:open:animate-none"
      >
        {open && (
          <div className="grid max-h-[inherit] overflow-y-auto sm:grid-cols-[280px_1fr]">
            <div className="relative aspect-[1.4] bg-[#eef0f5] sm:aspect-auto sm:min-h-[340px]">
              <Portrait person={open} sizes="(max-width: 640px) 100vw, 280px" />
            </div>
            <div className="grid content-start gap-4 p-7 sm:p-8">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[#6f7899]">{groupLabel}</p>
              <div>
                <h2 id="person-dialog-name" className="border-l-[3px] border-[#253D9A] pl-3.5 font-[family-name:var(--font-heading)] text-[26px] leading-tight text-[#171a2b]">
                  {open.name}
                </h2>
                {open.role && <p className="mt-1.5 pl-[17px] font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.08em] text-[#6f7899]">{open.role}</p>}
              </div>
              <p className="text-[15px] leading-relaxed text-[#4b4f66]">{open.bio || "A biography will be added soon."}</p>
              <div className="mt-1 grid justify-items-start gap-4">
                <ProfileLinks person={open} size="md" />
                <Link href={`/people/${open.slug}`} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#253D9A] hover:underline">
                  Open full profile <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close profile"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md border border-[#e3e6f0] bg-white/90 text-[18px] leading-none text-[#171a2b] backdrop-blur transition-colors hover:bg-[#171a2b] hover:text-white"
        >
          &times;
        </button>
      </dialog>
    </>
  );
}
