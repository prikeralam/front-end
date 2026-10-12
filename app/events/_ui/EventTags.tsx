import type { PRIEvent } from "../../_lib/types";

export const MODE_LABEL: Record<NonNullable<PRIEvent["mode"]>, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
};

const tag = "inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em]";

/** How people attend: a quiet outline tag, with a dot for online-capable events. */
export function ModeTag({ mode, onDark = false }: { mode: PRIEvent["mode"]; onDark?: boolean }) {
  if (!mode) return null;
  return (
    <span className={`${tag} border ${onDark ? "border-white/30 text-white/85" : "border-[#d5d9e8] text-[#4b4f66]"}`}>
      {mode !== "in_person" && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${onDark ? "bg-[#aebbf0]" : "bg-[#253D9A]"}`} />}
      {MODE_LABEL[mode]}
    </span>
  );
}

/** Upcoming in solid PRI blue (it's the one to act on); past in grey. */
export function TimingTag({ timing, onDark = false }: { timing: PRIEvent["timing"]; onDark?: boolean }) {
  // On the dark band, upcoming flips to white (still the strongest tag) and past to a quiet translucent one.
  return timing === "upcoming" ? (
    <span className={`${tag} ${onDark ? "bg-white text-[#16245c]" : "bg-[#253D9A] text-white"}`}>Upcoming</span>
  ) : (
    <span className={`${tag} ${onDark ? "bg-white/12 text-white/80" : "bg-[#eceef5] text-[#5b5f74]"}`}>Past</span>
  );
}
