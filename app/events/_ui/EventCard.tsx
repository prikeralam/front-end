import Link from "next/link";
import type { PRIEvent } from "../../_lib/types";
import MediaSlot from "../../_ui/MediaSlot";
import { ModeTag } from "./EventTags";

const KIND_LABEL: Record<PRIEvent["kind"], string> = { event: "Event", campaign: "Campaign" };

/** One event or campaign in a grid: on the events page and the homepage. */
export default function EventCard({ event }: { event: PRIEvent }) {
  return (
    <Link href={`/events/${event.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-[#e6e8f0] bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(23,26,43,0.10)]">
      {event.image && <MediaSlot need={event.image} />}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-fit rounded bg-[#253D9A]/8 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#253D9A]">{KIND_LABEL[event.kind]}</span>
          <ModeTag mode={event.mode} />
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug text-[#171a2b] group-hover:text-[#253D9A]">{event.title}</h3>
        <p className="mt-2 text-[13px] text-[#8b8fa3]">{[event.dateLabel, event.timeLabel].filter(Boolean).join(" · ")}</p>
        {event.location && <p className="text-[13px] text-[#8b8fa3]">{event.location}</p>}
      </div>
    </Link>
  );
}
