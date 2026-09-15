"use client";

import { useState, type ReactNode } from "react";

type Tab = { id: string; label: string; content: ReactNode };

export default function DatasetTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-[#e6e8f0]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[14px] font-bold transition-colors ${
              active === t.id ? "border-[#253D9A] text-[#253D9A]" : "border-transparent text-[#8b8fa3] hover:text-[#5b5f74]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-8">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
