"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

type Tab = { id: string; label: string; content: ReactNode };

/** Accessible tabs: arrow keys move between tabs, and only the active panel is shown. */
export default function DatasetTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.findIndex((t) => t.id === active);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    setActive(next.id);
    document.getElementById(`${base}-tab-${next.id}`)?.focus();
  }

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Dataset details" onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_#e3e6f0] [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`${base}-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-[14px] font-semibold transition-colors ${
              active === t.id ? "border-[#253D9A] text-[#253D9A]" : "border-transparent text-[#6f7899] hover:text-[#3a4263]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`${base}-panel-${t.id}`} role="tabpanel" aria-labelledby={`${base}-tab-${t.id}`} hidden={active !== t.id} className="py-8">
          {t.content}
        </div>
      ))}
    </div>
  );
}
