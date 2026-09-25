import type { components } from "./schema";
import type { Person } from "../types";

type ApiPerson = components["schemas"]["PersonProfile"];

/** Maps a backend `PersonProfile` onto the frontend's `Person` so existing components render it unchanged. */
export function toPerson(person: ApiPerson, group: Person["group"]): Person {
  return {
    slug: person.slug,
    name: person.name,
    role: person.role_title,
    group,
    bio: person.bio || undefined,
    status: "real",
    photo: {
      label: `${person.name} — ${person.role_title} portrait`,
      ratio: "square",
      kind: "photo",
      // Empty `photo_url` leaves `src` unset, which falls back to the themed stock portrait like before.
      src: person.photo_url || undefined,
    },
  };
}
