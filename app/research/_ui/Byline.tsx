import Image from "next/image";
import Link from "next/link";
import { joinNames } from "../../_lib/names";
import { stockPhotoFor } from "../../_lib/stockPhotos";
import type { Person } from "../../_lib/types";

/**
 * Overlapping portraits and "A, B and C" for a publication's authors. `linked` makes each name a link to the person's
 * profile (not on cards, which are links themselves); `dark` is for the article header's dark band.
 */
export default function Byline({ people, linked = false, dark = false, size = 28 }: { people: Person[]; linked?: boolean; dark?: boolean; size?: number }) {
  if (people.length === 0) return null;
  const withPhotos = people.filter((p) => p.photo).slice(0, 4);
  const ring = dark ? "ring-[#16245c]" : "ring-white";
  const nameClass = dark ? "font-semibold text-white hover:underline" : "font-semibold text-[#3a3e56] hover:text-[#253D9A]";

  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      {withPhotos.length > 0 && (
        <span aria-hidden="true" className="flex shrink-0 -space-x-2">
          {withPhotos.map((p) => (
            <span key={p.slug} className={`relative overflow-hidden rounded-full bg-white ring-2 ${ring}`} style={{ width: size, height: size }}>
              <Image src={p.photo?.src ?? (p.photo ? stockPhotoFor(p.photo) : undefined) ?? ""} alt="" fill sizes={`${size}px`} className="object-cover" />
            </span>
          ))}
        </span>
      )}
      <span className="min-w-0">
        {linked ? (
          <>
            By{" "}
            {people.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && (i === people.length - 1 ? " and " : ", ")}
                <Link href={`/people/${p.slug}`} className={nameClass}>
                  {p.name}
                </Link>
              </span>
            ))}
          </>
        ) : (
          joinNames(people.map((p) => p.name))
        )}
      </span>
    </span>
  );
}
