import type { Partner } from "../_lib/types";

// PLACEHOLDER — no partner organisations named yet. Descriptions draw on PRI's
// stated partnership functions from the previous site.
export const partners: Partner[] = [
  {
    slug: "institutional-one",
    name: "Partner organisation",
    description: "Partnering with government agencies to provide insights for improved public service delivery.",
    type: "institutional",
    status: "placeholder",
    logo: { label: "Partner logo", ratio: "3:2", kind: "logo" },
  },
  {
    slug: "institutional-two",
    name: "Partner organisation",
    description: "Developing MOUs to create partnerships with NGOs and institutes on key initiatives and shared objectives.",
    type: "institutional",
    status: "placeholder",
    logo: { label: "Partner logo", ratio: "3:2", kind: "logo" },
  },
  {
    slug: "institutional-three",
    name: "Partner organisation",
    description: "Joining our network of academic institutions for knowledge sharing and capacity building.",
    type: "institutional",
    status: "placeholder",
    logo: { label: "Partner logo", ratio: "3:2", kind: "logo" },
  },
  {
    slug: "institutional-four",
    name: "Partner organisation",
    description: "Description to be supplied.",
    type: "institutional",
    status: "placeholder",
    logo: { label: "Partner logo", ratio: "3:2", kind: "logo" },
  },
  {
    slug: "institutional-five",
    name: "Partner organisation",
    description: "Description to be supplied.",
    type: "institutional",
    status: "placeholder",
    logo: { label: "Partner logo", ratio: "3:2", kind: "logo" },
  },
  {
    slug: "institutional-six",
    name: "Partner organisation",
    description: "Description to be supplied.",
    type: "institutional",
    status: "placeholder",
    logo: { label: "Partner logo", ratio: "3:2", kind: "logo" },
  },
  {
    slug: "consortium-one",
    name: "Name Surname",
    description: "Building strong relationships with civil society for collaborative action and impact.",
    type: "consortium",
    status: "placeholder",
    logo: { label: "Consortium member portrait", ratio: "square", kind: "photo" },
  },
  {
    slug: "consortium-two",
    name: "Name Surname",
    description: "A network promoting collaboration among researchers and academicians across areas of expertise.",
    type: "consortium",
    status: "placeholder",
    logo: { label: "Consortium member portrait", ratio: "square", kind: "photo" },
  },
  {
    slug: "consortium-three",
    name: "Name Surname",
    description: "Description to be supplied.",
    type: "consortium",
    status: "placeholder",
    logo: { label: "Consortium member portrait", ratio: "square", kind: "photo" },
  },
];

export const institutionalPartners = partners.filter((p) => p.type === "institutional");
export const consortiumMembers = partners.filter((p) => p.type === "consortium");

export const partnerForms = [
  { title: "Become a Partner", desc: "For organisations seeking a formal institutional partnership or MOU with PRI." },
  { title: "Collaborate on Research", desc: "For researchers and institutions proposing a joint study or shared dataset." },
  { title: "Co-host an Event", desc: "For partners proposing a seminar, workshop, or roundtable with PRI." },
];
