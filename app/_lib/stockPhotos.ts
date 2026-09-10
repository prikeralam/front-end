/**
 * Curated, hand-verified Unsplash photography standing in for real PRI
 * photography (headshots, event photos, report covers, etc.) that hasn't
 * been supplied yet. Every id below was fetched and visually checked before
 * being added here — no unverified or auto-generated ids.
 *
 * Swap for real PRI photography as it becomes available; until then this
 * keeps every MediaSlot "photo" need populated with something on-theme
 * instead of a dashed placeholder box.
 */
import type { MediaNeed } from "./types";

const u = (id: string) => `https://images.unsplash.com/${id}`;

/** Square-ish headshots, mixed gender/style, for person/researcher portraits. */
const PORTRAITS = [
  "photo-1560250097-0b93528c311a",
  "photo-1580489944761-15a19d654956",
  "photo-1544005313-94ddf0286df2",
  "photo-1568602471122-7832951cc4c5",
  "photo-1607990281513-2c110a25bd8c",
  "photo-1531123897727-8f129e1688ce",
  "photo-1489980557514-251d61e3eeb6",
  "photo-1544717305-2782549b5136",
  "photo-1517841905240-472988babdf9",
  "photo-1494790108377-be9c29b29330",
  "photo-1508214751196-bcfd4ca60f91",
].map(u);

const THEME = {
  meeting: u("photo-1521737604893-d14cc237f11d"),
  handshake: u("photo-1521791136064-7986c2920216"),
  library: u("photo-1521587760476-6c12a4b040da"),
  documents: u("photo-1450101499163-c8848c66ca85"),
  dashboard: u("photo-1460925895917-afdab827c52f"),
  dashboardDark: u("photo-1551288049-bebda4e38f71"),
  newspaper: u("photo-1495020689067-958852a7765e"),
  gavel: u("photo-1589391886645-d51941baf7fb"),
  notes: u("photo-1517842645767-c639042777db"),
  teamDiverse: u("photo-1522202176988-66273c2fd55f"),
  eventMic: u("photo-1475721027785-f74eccf877e2"),
  classroom: u("photo-1503676260728-1c00da094a0b"),
  worldMap: u("photo-1524661135-423995f22d0b"),
  libraryGroup: u("photo-1523240795612-9a054b0db644"),
};

/** Simple deterministic string hash so the same label always maps to the same portrait. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Returns a themed stock photo URL for a MediaNeed, or null when the slot
 * should stay a dashed placeholder (non-photo kinds, and screenshots, which
 * a stock photo would misrepresent as a real capture).
 */
export function stockPhotoFor(need: MediaNeed): string | null {
  if (need.kind !== "photo") return null;
  const label = need.label.toLowerCase();
  if (label.includes("screenshot")) return null;

  if (label.includes("portrait") || label.includes("headshot")) {
    return PORTRAITS[hash(need.label) % PORTRAITS.length];
  }
  if (label.includes("cover")) return THEME.library;
  if (label.includes("dashboard") || label.includes("analytics")) return THEME.dashboard;
  if (label.includes("newspaper") || label.includes("media") || label.includes("press")) return THEME.newspaper;
  if (label.includes("legal") || label.includes("scorecard") || label.includes("policy")) return THEME.gavel;
  if (label.includes("note")) return THEME.notes;
  if (label.includes("event") || label.includes("webinar") || label.includes("launch") || label.includes("workshop") || label.includes("roundtable"))
    return THEME.eventMic;
  if (label.includes("programme") || label.includes("funder") || label.includes("partner")) return THEME.handshake;
  if (label.includes("volunteer") || label.includes("team")) return THEME.teamDiverse;
  if (label.includes("library") || label.includes("research")) return THEME.library;
  if (label.includes("document") || label.includes("signing") || label.includes("gallery")) return THEME.documents;
  if (label.includes("hero") || label.includes("community")) return THEME.meeting;

  return THEME.meeting;
}

/** Hand-picked hero images for the three named homepage projects. */
export const heroProjectPhotos: Record<string, string> = {
  motto: THEME.meeting,
  "sir-project": THEME.libraryGroup,
  education: THEME.classroom,
  "demography-migration": THEME.worldMap,
};

/** Hand-picked, on-theme cover photos for the "Kerala in Data" story series, keyed by publication slug. */
export const dataStoryCoverPhotos: Record<string, string> = {
  "malappuram-classrooms": u("photo-1709290749293-c6152a187b14"), // crowded Indian classroom
  "kerala-population-mix": u("photo-1777802059614-2d892adb2de6"), // Fort Kochi street scene
  "kerala-healthcare-gap": u("photo-1517120026326-d87759a7b63b"), // hospital corridor, staff with incubator
  "kerala-gulf-migration": u("photo-1780683164903-9c4a8e365b84"), // travellers silhouetted at an airport window
};
