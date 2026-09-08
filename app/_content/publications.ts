import type { Publication } from "../_lib/types";

export const publicationThemes = ["Education", "Employment", "Economics", "Public Finance", "Health", "Governance", "Demography", "Migration"];
export const publicationFormats = ["Report", "Working Paper", "Brief", "Explainer", "Infographic", "Video", "Data Story"];

// The two "Ongoing" studies are real — they were listed as current research
// initiatives on PRI's previous site.
export const publications: Publication[] = [
  {
    slug: "educational-equity-assessment",
    title: "Educational Equity Assessment",
    abstract:
      "Comprehensive analysis of educational access, quality, and outcomes across different communities to identify gaps and recommend interventions. Status: ongoing, expected Q2 2024.",
    format: "Report",
    theme: "Education",
    date: "Ongoing",
    authors: ["Name Surname"],
    status: "real",
    cover: { label: "Report cover — Educational Equity Assessment", ratio: "4:3", kind: "photo" },
  },
  {
    slug: "employment-patterns-study",
    title: "Employment Patterns Study",
    abstract:
      "Longitudinal study examining employment trends, skill gaps, and opportunities for workforce development in emerging sectors. Status: data collection, expected Q3 2024.",
    format: "Working Paper",
    theme: "Employment",
    date: "Ongoing",
    authors: ["Name Surname"],
    status: "real",
    cover: { label: "Report cover — Employment Patterns Study", ratio: "4:3", kind: "photo" },
  },

  // --- Kerala in Data series (real, integrated as normal Research & Publications entries) ---
  {
    slug: "malappuram-classrooms",
    title: "Malappuram's Plus One classrooms are Kerala's most crowded",
    abstract:
      "The district enrolls more first-year higher-secondary students than anywhere else in the state — packed into the largest batches, with the least room in the science stream.",
    format: "Data Story",
    theme: "Education",
    date: "To be confirmed",
    authors: ["PRI Research Team"],
    status: "real",
    cover: { label: "Malappuram classrooms data dashboard visual", ratio: "4:3", kind: "photo" },
  },
  {
    slug: "kerala-population-mix",
    title: "Kerala's religious population mix is shifting slowly",
    abstract:
      "Muslims' share of Kerala's population rose gradually between the 2011 Census and 2024 estimates. Over the same recent decade, the number of births to Muslim families in the state fell by more than a quarter — a leading indicator that the pace of change is easing, not accelerating.",
    format: "Data Story",
    theme: "Demography",
    date: "To be confirmed",
    authors: ["PRI Research Team"],
    status: "real",
    cover: { label: "Kerala population mix data dashboard visual", ratio: "4:3", kind: "photo" },
  },
  {
    slug: "kerala-healthcare-gap",
    title: "Where Kerala's healthcare capacity runs thin",
    abstract:
      "On primary care, hospital beds and doctors, Malappuram and Kozhikode carry close to double the load of the state average — and the gap shows up the same way on all three measures.",
    format: "Data Story",
    theme: "Health",
    date: "To be confirmed",
    authors: ["PRI Research Team"],
    status: "real",
    cover: { label: "Kerala healthcare gap data dashboard visual", ratio: "4:3", kind: "photo" },
  },
  {
    slug: "kerala-gulf-migration",
    title: "Kerala's migration economy runs through the Gulf",
    abstract:
      "Muslims make up under a third of Kerala's population but nearly 42% of its emigrants, and almost all of that emigration — 98.5% — goes to the Gulf, leaving the community more exposed than any other to shocks in Gulf labour markets.",
    format: "Data Story",
    theme: "Migration",
    date: "To be confirmed",
    authors: ["PRI Research Team"],
    status: "real",
    cover: { label: "Kerala Gulf migration data dashboard visual", ratio: "4:3", kind: "photo" },
  },
];
