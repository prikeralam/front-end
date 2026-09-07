import type { MediaCase } from "../_lib/types";

export const classifications = ["Misinformation", "Hate Speech", "Biased Coverage"];

// PLACEHOLDER — no media-watch cases supplied. Framing text below is PRI's own
// description of the rapid-response function from the previous site.
export const mediaCases: MediaCase[] = [
  {
    slug: "case-one",
    headline: "Flagged claim awaiting details",
    summary: "Real-time issue tracking, news analysis, and proactive engagement.",
    classification: "Misinformation",
    source: "Source outlet to be confirmed",
    date: "To be confirmed",
    response: "Timely and research-backed responses to emerging socio-political issues to inform public debate.",
    status: "placeholder",
    screenshot: { label: "Screenshot of the flagged item", ratio: "16:9", kind: "photo" },
  },
  {
    slug: "case-two",
    headline: "Flagged coverage awaiting details",
    summary: "Summary to be supplied.",
    classification: "Biased Coverage",
    source: "Source outlet to be confirmed",
    date: "To be confirmed",
    response: "PRI response to be supplied.",
    status: "placeholder",
    screenshot: { label: "Screenshot of the flagged item", ratio: "16:9", kind: "photo" },
  },
  {
    slug: "case-three",
    headline: "Flagged content awaiting details",
    summary: "Summary to be supplied.",
    classification: "Hate Speech",
    source: "Source outlet to be confirmed",
    date: "To be confirmed",
    response: "PRI response to be supplied.",
    status: "placeholder",
    screenshot: { label: "Screenshot of the flagged item", ratio: "16:9", kind: "photo" },
  },
];

// PLACEHOLDER — video explainers and toolkit assets not produced yet.
export const explainers = [
  {
    title: "Video explainer",
    desc: "Creating strategic multimedia content collaborating with influencers to ensure last-mile reach.",
    status: "placeholder" as const,
    media: { label: "Short-form video explainer", ratio: "16:9", kind: "video" as const },
  },
  {
    title: "Video explainer",
    desc: "Description to be supplied.",
    status: "placeholder" as const,
    media: { label: "Short-form video explainer", ratio: "16:9", kind: "video" as const },
  },
];

export const toolkits = [
  { title: "Press statement", kind: "PDF", status: "placeholder" as const },
  { title: "Social media toolkit", kind: "Asset pack", status: "placeholder" as const },
  { title: "Shareable graphics", kind: "Asset pack", status: "placeholder" as const },
];
