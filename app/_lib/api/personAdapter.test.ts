import { describe, expect, it } from "vitest";
import type { components } from "./schema";
import { isPersonGroup, toPartner, toPerson } from "./personAdapter";

type ApiPerson = components["schemas"]["PersonProfile"];

const apiPerson: ApiPerson = {
  id: 7,
  slug: "noushad",
  name: "Dr. Noushad T",
  role_title: "Director of Operations",
  group: "team",
  bio: "Leads operations.",
  photo_url: "https://cdn.example.org/people/noushad.jpg",
  status: "published",
  created_by: 1,
  reviewed_by: null,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-02T00:00:00Z",
};

describe("toPerson", () => {
  it("maps API fields onto the frontend Person shape", () => {
    expect(toPerson(apiPerson, "team")).toEqual({
      slug: "noushad",
      name: "Dr. Noushad T",
      role: "Director of Operations",
      group: "team",
      bio: "Leads operations.",
      status: "real",
      photo: {
        label: "Portrait of Dr. Noushad T, Director of Operations",
        ratio: "square",
        kind: "photo",
        src: "https://cdn.example.org/people/noushad.jpg",
      },
    });
  });

  it("leaves bio and photo src unset when the backend sends empty strings", () => {
    const person = toPerson({ ...apiPerson, bio: "", photo_url: "" }, "team");

    expect(person.bio).toBeUndefined();
    expect(person.photo?.src).toBeUndefined();
  });

  it("carries the public LinkedIn and email links, and drops empty ones", () => {
    const linked = toPerson({ ...apiPerson, linkedin_url: "https://www.linkedin.com/in/noushad", email: "noushad@priresearch.in" }, "team");
    expect([linked.linkedin, linked.email]).toEqual(["https://www.linkedin.com/in/noushad", "noushad@priresearch.in"]);

    const blank = toPerson({ ...apiPerson, linkedin_url: "", email: "" }, "team");
    expect([blank.linkedin, blank.email]).toEqual([undefined, undefined]);
  });
});

describe("isPersonGroup", () => {
  it("accepts people groups and rejects partner", () => {
    expect(isPersonGroup("executive")).toBe(true);
    expect(isPersonGroup("partner")).toBe(false);
  });
});

describe("toPartner", () => {
  it("links to the partner's website only when it is https", () => {
    const partner = { ...apiPerson, group: "partner" as const, role_title: "Partner institution" };
    expect(toPartner({ ...partner, website_url: "https://safi.ac.in" }).website).toBe("https://safi.ac.in");
    expect(toPartner({ ...partner, website_url: "javascript:alert(1)" }).website).toBeUndefined();
    expect(toPartner({ ...partner, website_url: "" }).website).toBeUndefined();
  });

  it("treats a role_title containing institution as an institution, anything else as a researcher", () => {
    const institution = toPartner({ ...apiPerson, group: "partner", role_title: "Partner institution" });
    const researcher = toPartner({ ...apiPerson, group: "partner", role_title: "Research fellow" });

    expect(institution.type).toBe("institution");
    expect(researcher.type).toBe("researcher");
    expect(institution.logo?.src).toBe("https://cdn.example.org/people/noushad.jpg");
    expect(institution.description).toBe("Leads operations.");
  });
});
