import type { PRIEvent } from "../../_lib/types";

export const MODE_LABEL: Record<NonNullable<PRIEvent["mode"]>, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
};

const tag = "inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em]";

/** How people attend: a quiet outline tag, with a dot for online-capable events. */
export function ModeTag({ mode }: { mode: PRIEvent["mode"] }) {
  if (!mode) return null;
  return (
    <span className={`${tag} border border-[#d5d9e8] text-[#4b4f66]`}>
      {mode !== "in_person" && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#253D9A]" />}
      {MODE_LABEL[mode]}
    </span>
  );
}

/** Upcoming in solid PRI blue (it's the one to act on); past in grey. */
export function TimingTag({ timing }: { timing: PRIEvent["timing"] }) {
  return timing === "upcoming" ? (
    <span className={`${tag} bg-[#253D9A] text-white`}>Upcoming</span>
  ) : (
    <span className={`${tag} bg-[#eceef5] text-[#5b5f74]`}>Past</span>
  );
}
