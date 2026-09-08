import type { Partner } from "../_lib/types";

// Institutional partner names supplied by PRI. Descriptions and logos still
// need to be confirmed — draws on PRI's stated partnership functions from
// the previous site until real descriptions are supplied.
export const partners: Partner[] = [
  {
    slug: "safi-institute",
    name: "SAFI Group of Institutions",
    description: "Description to be supplied.",
    type: "institution",
    status: "real",
    logo: { label: "SAFI Group of Institutions logo", ratio: "3:2", kind: "logo", src: "/people/partners/safi.jpg" },
  },
  {
    slug: "ch-chair",
    name: "CH Mohammed Koya Chair for Studies on Developing Societies",
    description: "University of Calicut.",
    type: "institution",
    status: "real",
    logo: { label: "CH Mohammed Koya Chair logo", ratio: "3:2", kind: "logo", src: "/people/partners/ch-chair.jpg" },
  },
  {
    slug: "cse",
    name: "HADIA Centre for Social Excellence",
    description: "Description to be supplied.",
    type: "institution",
    status: "real",
    logo: { label: "HADIA Centre for Social Excellence logo", ratio: "3:2", kind: "logo", src: "/people/partners/cse.png" },
  },
  {
    slug: "mamburam-thangal-institute",
    name: "Mamburam Thangal Institute",
    description: "Description to be supplied.",
    type: "institution",
    status: "real",
    logo: { label: "Mamburam Thangal Institute logo", ratio: "3:2", kind: "logo", src: "/people/partners/mamburam-thangal-institute.jpg" },
  },

  // PLACEHOLDER — individual research partners not named yet.
  {
    slug: "researcher-one",
    name: "Name Surname",
    description: "Building strong relationships with civil society for collaborative action and impact.",
    type: "researcher",
    status: "placeholder",
    logo: { label: "Researcher portrait 1", ratio: "square", kind: "photo" },
  },
  {
    slug: "researcher-two",
    name: "Name Surname",
    description: "A network promoting collaboration among researchers and academicians across areas of expertise.",
    type: "researcher",
    status: "placeholder",
    logo: { label: "Researcher portrait 2", ratio: "square", kind: "photo" },
  },
  {
    slug: "researcher-three",
    name: "Name Surname",
    description: "Description to be supplied.",
    type: "researcher",
    status: "placeholder",
    logo: { label: "Researcher portrait 3", ratio: "square", kind: "photo" },
  },
];

export const institutions = partners.filter((p) => p.type === "institution");
export const researchers = partners.filter((p) => p.type === "researcher");

export const partnerForms = [
  { title: "Become a Partner", desc: "For organisations seeking a formal institutional partnership or MOU with PRI." },
  { title: "Collaborate on Research", desc: "For researchers and institutions proposing a joint study or shared dataset." },
  { title: "Co-host an Event", desc: "For partners proposing a seminar, workshop, or roundtable with PRI." },
];
