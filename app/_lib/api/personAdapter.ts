import type { components } from "./schema";
import type { Partner, Person } from "../types";

type ApiPerson = components["schemas"]["PersonProfile"];

const PERSON_GROUPS: readonly Person["group"][] = ["team", "patron", "advisory", "executive", "fellow", "past-fellow", "author"];

/** `partner` profiles are organisations, not people: they go through `toPartner`. */
export function isPersonGroup(group: ApiPerson["group"]): group is Person["group"] {
  return (PERSON_GROUPS as readonly string[]).includes(group);
}

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
      // An uploaded photo wins over the link; neither leaves `src` unset, which falls back to the themed stock portrait like before.
      src: person.photo || person.photo_url || undefined,
    },
  };
}

/**
 * Partners are `PersonProfile`s in the `partner` group; the contract has no institution/researcher field, so the
 * split follows the convention that an institution's `role_title` contains "institution" (backend gap G5).
 */
export function toPartner(person: ApiPerson): Partner {
  return {
    slug: person.slug,
    name: person.name,
    description: person.bio ?? "",
    type: /institution/i.test(person.role_title) ? "institution" : "researcher",
    status: "real",
    logo: {
      label: `${person.name} logo`,
      ratio: "3:2",
      kind: "logo",
      src: person.photo || person.photo_url || undefined,
    },
  };
}
