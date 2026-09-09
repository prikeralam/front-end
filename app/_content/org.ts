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
  email: "workgroup.drc@gmail.com",
  phone: "+91 96052 21921",
  address: ["HADIA Center for Social Excellence", "Panakkad, Pattarkadavu P.O", "Kerala, India"],
  status: "real" as ContentStatus,
};

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

export const pillars = [
  {
    title: "Research & Analysis Wing",
    desc: "Five specialised departments examining gaps, inequalities, and opportunities across different societal sections through a multidisciplinary approach.",
    href: "/research",
  },
  {
    title: "Policy Advocacy & Engagement",
    desc: "Active engagement with policymakers to ensure research findings translate into actionable policies and solutions.",
    href: "/advocacy",
  },
  {
    title: "Outreach & Production House",
    desc: "Comprehensive outreach through publications, media engagement, and strategic content to shape public discourse.",
    href: "/media-watch",
  },
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

export const researchDomains = [
  { title: "Education", desc: "Analyzing educational access, quality, and outcomes across different communities and regions." },
  { title: "Employment", desc: "Examining employment patterns, skill development, and occupational opportunities." },
  { title: "Economics", desc: "Analyzing economic patterns, wealth distribution, and market participation." },
  { title: "Public Finance", desc: "Budget allocation analysis, expenditure patterns, and fiscal policy evaluation." },
  { title: "Health", desc: "Healthcare accessibility, delivery systems, and public health outcomes research." },
  { title: "Environment", desc: "Environmental sustainability, climate resilience, and ecological impact studies." },
  { title: "Politics & Representation", desc: "Electoral dynamics, political participation, and legislative representation studies." },
  { title: "Demography & Diaspora", desc: "Population studies, migration patterns, and diaspora community analysis." },
  { title: "Crime and Judiciary", desc: "Researching justice system effectiveness, legal access, and crime prevention strategies." },
  { title: "Communication", desc: "Studying communication infrastructure, digital divide, and information accessibility." },
  { title: "Community Infrastructure", desc: "Infrastructure development, community facilities, and urban planning research." },
];

export const methodology = [
  { title: "Quantitative Analysis", desc: "Statistical analysis of large datasets to identify patterns, trends, and correlations across different demographic and geographic segments." },
  { title: "Qualitative Research", desc: "In-depth interviews, focus groups, and ethnographic studies to understand lived experiences and contextual factors." },
  { title: "Policy Evaluation", desc: "Systematic evaluation of existing policies and programs to assess effectiveness and identify areas for improvement." },
];

/** Grouped navigation IA — shared across all three design variants. */
export const nav = [
  {
    label: "About",
    items: [
      { label: "Who we are", href: "/about" },
      { label: "Donors & Sponsors", href: "/donors" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Our Team", href: "/people/team" },
      { label: "Patrons", href: "/people/patrons" },
      { label: "Executive Council", href: "/people/executive" },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    label: "Research",
    items: [
      { label: "Research & Publications", href: "/research" },
      { label: "Data Repository", href: "/data" },
      { label: "Media Watch", href: "/media-watch" },
    ],
  },
  {
    label: "Engage",
    items: [
      { label: "Advocacy & Policy", href: "/advocacy" },
      { label: "Events & Campaigns", href: "/events" },
      { label: "Fellowships & Internships", href: "/fellowship" },
      { label: "Get Involved", href: "/get-involved" },
    ],
  },
  {
    label: "Contact",
    href: "/contact",
    items: [] as { label: string; href: string }[],
  },
];
