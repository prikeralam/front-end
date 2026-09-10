import type { Publication } from "../_lib/types";
import { dataStoryCoverPhotos } from "../_lib/stockPhotos";

export const publicationThemes = ["Education", "Employment", "Economics", "Public Finance", "Health", "Governance", "Demography", "Migration"];
export const publicationFormats = ["Report", "Working Paper", "Data Story"];
export const publicationLanguages = ["English", "Malayalam"];

// --- Kerala in Data series (real, integrated as normal Research & Publications entries) ---
export const publications: Publication[] = [
  {
    slug: "malappuram-classrooms",
    title: "Malappuram's Plus One classrooms are Kerala's most crowded",
    abstract:
      "The district enrolls more first-year higher-secondary students than anywhere else in the state — packed into the largest batches, with the least room in the science stream.",
    format: "Data Story",
    theme: "Education",
    date: "To be confirmed",
    authors: ["pri-research-team"],
    language: "English",
    status: "real",
    views: 1240,
    cover: { label: "Malappuram classrooms data dashboard visual", ratio: "4:3", kind: "photo", src: dataStoryCoverPhotos["malappuram-classrooms"] },
  },
  {
    slug: "kerala-population-mix",
    title: "Kerala's religious population mix is shifting slowly",
    abstract:
      "Muslims' share of Kerala's population rose gradually between the 2011 Census and 2024 estimates. Over the same recent decade, the number of births to Muslim families in the state fell by more than a quarter — a leading indicator that the pace of change is easing, not accelerating.",
    format: "Data Story",
    theme: "Demography",
    date: "To be confirmed",
    authors: ["pri-research-team"],
    language: "English",
    status: "real",
    views: 980,
    cover: { label: "Kerala population mix data dashboard visual", ratio: "4:3", kind: "photo", src: dataStoryCoverPhotos["kerala-population-mix"] },
  },
  {
    slug: "kerala-healthcare-gap",
    title: "Where Kerala's healthcare capacity runs thin",
    abstract:
      "On primary care, hospital beds and doctors, Malappuram and Kozhikode carry close to double the load of the state average — and the gap shows up the same way on all three measures.",
    format: "Data Story",
    theme: "Health",
    date: "To be confirmed",
    authors: ["pri-research-team"],
    language: "English",
    status: "real",
    views: 860,
    cover: { label: "Kerala healthcare gap data dashboard visual", ratio: "4:3", kind: "photo", src: dataStoryCoverPhotos["kerala-healthcare-gap"] },
  },
  {
    slug: "kerala-gulf-migration",
    title: "Kerala's migration economy runs through the Gulf",
    abstract:
      "Muslims make up under a third of Kerala's population but nearly 42% of its emigrants, and almost all of that emigration — 98.5% — goes to the Gulf, leaving the community more exposed than any other to shocks in Gulf labour markets.",
    format: "Data Story",
    theme: "Migration",
    date: "To be confirmed",
    authors: ["pri-research-team"],
    language: "English",
    status: "real",
    views: 640,
    cover: { label: "Kerala Gulf migration data dashboard visual", ratio: "4:3", kind: "photo", src: dataStoryCoverPhotos["kerala-gulf-migration"] },
  },
];
