// Content marked `real` was lifted from PRI's previous site
// (harmonious-zabaione-40468a.netlify.app). Everything marked `placeholder`
// is invented to make layouts legible and needs real copy from PRI.

import type { ContentStatus } from "../_lib/types";

export const org = {
  name: "Policy and Research Initiative",
  short: "PRI",
  tagline: "Driving Inclusive Development",
  summary:
    "A dedicated think tank committed to promoting inclusive development, social justice, and national integration through data-driven research and evidence-based policy advocacy.",
  intro:
    "PRI brings together researchers, policymakers, community leaders, and civil society representatives to address socio-economic and political disparities, ensuring equal opportunities and fair representation.",
  email: "contact@priresearch.in",
  phone: "+91 96052 21921",
  address: ["West Kodur", "Kodur PO", "Malappuram Dt, Kerala, India", "676504"],
  mapUrl: "https://maps.app.goo.gl/pYeLtPJWy6aAuSDA8",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.1031468509!2d76.05481567686878!3d11.030887489133773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba64b000079cc33%3A0xc39cf9903f7f5ab0!2sPolicy%20and%20Research%20Initiative!5e0!3m2!1sen!2sin!4v1789020272719!5m2!1sen!2sin",
  registration: {
    regNo: "MPM/CA/204/2025",
    pan12A: "AAOAP9667ME20251",
    cert80G: "AAOAP9667MF20251",
  },
  status: "real" as ContentStatus,
};

export const legalStatus = [
  { label: "Registration", value: org.registration.regNo, note: "Registered Society" },
  { label: "12A Status", value: org.registration.pan12A, note: "Income Tax Act, 1961" },
  { label: "80G Status", value: org.registration.cert80G, note: "Donations tax-deductible" },
];

export const vision = {
  text: "To create a society where every individual has equitable access to opportunities and resources. We envision an empowered society where all people can actively engage in socio-economic and political processes, fostering a culture of equity, inclusion, and mutual respect.",
  status: "real" as ContentStatus,
};

export const missionPoints = [
  "Conduct rigorous, data-driven research to identify and outline systemic inequalities.",
  "Develop evidence-based policies and recommendations to address issues and problems.",
  "Engage in strategic advocacy efforts with policymakers and key stakeholders.",
  "Empower decision-makers and the public through knowledge sharing and capacity building.",
];

export const departments = [
  {
    name: "Center for Human Capital Development",
    areas: [
      "Educational Statistics",
      "Occupational and Employment Patterns",
      "Skill Development and Capacity Building",
      "Accessibility and Opportunities",
    ],
  },
  {
    name: "Center for Economic Analysis",
    areas: [
      "Wealth and Income Distribution",
      "Market Participation and Ownership Patterns",
      "Budget Allocation and Expenditure",
      "Agriculture and Industry",
      "Public Infrastructure",
      "Environment and Resilience",
    ],
  },
  {
    name: "Department of Society Development",
    areas: [
      "Organizations and Community Institutions",
      "Philanthropic and Welfare Activities",
      "Inter-religious Harmony",
      "Resource Allocation and Optimization",
    ],
  },
  {
    name: "Center for Governance and Policy Analysis",
    areas: [
      "Public Policy Analysis",
      "Political Participation and Legislative Representation",
      "Schemes and Programmes",
    ],
  },
  {
    name: "Demography & Health Research Unit",
    areas: [
      "Demography and Population Studies",
      "Migration and Remittances",
      "Healthcare Accessibility and Delivery",
    ],
  },
];

/** Grouped navigation IA — shared across all three design variants. */
export const nav = [
  {
    label: "About",
    items: [
      { label: "Who we are", href: "/about" },
      { label: "Annual Reports", href: "/about/annual-reports" },
    ],
  },
  {
    label: "Research",
    href: "/research",
    items: [] as { label: string; href: string }[],
  },
  {
    label: "Projects",
    href: "/projects",
    items: [] as { label: string; href: string }[],
  },
  {
    label: "Data",
    href: "/data",
    items: [] as { label: string; href: string }[],
  },
  {
    label: "People",
    items: [
      { label: "Patrons", href: "/people/patrons" },
      { label: "Advisory Body", href: "/people/advisory" },
      { label: "Executive Council", href: "/people/executive" },
      { label: "Partners", href: "/partners" },
      { label: "Our Team", href: "/people/team" },
    ],
  },
  {
    label: "Engage",
    items: [
      { label: "Events & Campaigns", href: "/events" },
      { label: "Fellowships & Internships", href: "/fellowship" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
