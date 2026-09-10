"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const portalNav = [
  { label: "Dashboard", href: "/v2/dashboard" },
  { label: "Favorites", href: "/v2/dashboard/favorites" },
  { label: "Downloads", href: "/v2/dashboard/downloads" },
  { label: "API Access", href: "/v2/dashboard/api" },
  { label: "Manage Datasets", href: "/v2/dashboard/manage" },
];

export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#e6e8f0] bg-white">
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6">
        {portalNav.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`shrink-0 border-b-2 px-3 py-3 text-[13px] font-semibold transition-colors ${
                active ? "border-[#253D9A] text-[#253D9A]" : "border-transparent text-[#5b5f74] hover:text-[#171a2b]"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
