"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canContributeContent, isAdmin, type Session } from "../../_lib/session";
import { useLocalFlag } from "../../_lib/useLocalFlag";
import { useSession } from "../../_lib/useSession";

type NavItem = { label: string; href: string };
type NavSection = { label: string; items: NavItem[] };

const COLLAPSE_KEY = "pri_sidebar_collapsed";

function buildSections(session: Session | null): NavSection[] {
  const canManageContent = canContributeContent(session);
  const admin = isAdmin(session);

  const sections: NavSection[] = [
    { label: "", items: [{ label: "Dashboard", href: "/dashboard" }] },
  ];

  if (canManageContent) {
    sections.push({
      label: "Content",
      items: [
        { label: "Pages & Content Blocks", href: "/dashboard/content" },
        { label: "Testimonials", href: "/dashboard/content/testimonials" },
        { label: "Documents", href: "/dashboard/content/documents" },
      ],
    });
    sections.push({
      label: "Team & People",
      items: [
        { label: "People Directory", href: "/dashboard/team" },
        { label: "Partners", href: "/dashboard/team/partners" },
      ],
    });
    sections.push({ label: "Projects", items: [{ label: "Projects", href: "/dashboard/projects" }] });
    sections.push({ label: "Research & Publications", items: [{ label: "Publications", href: "/dashboard/research" }] });
    sections.push({ label: "Data Repository", items: [{ label: "Manage Datasets", href: "/dashboard/manage" }] });
  }

  if (admin) {
    sections.push({
      label: "Administration",
      items: [
        { label: "Audit Log", href: "/dashboard/audit" },
      ],
    });
  }

  return sections;
}

function SidebarLink({ item, collapsed, active, onNavigate }: { item: NavItem; collapsed: boolean; active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
        active ? "bg-[#253D9A]/10 text-[#253D9A]" : "text-[#5b5f74] hover:bg-[#f0f1f5] hover:text-[#171a2b]"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          active ? "bg-[#253D9A] text-white" : "bg-[#e6e8f0] text-[#5b5f74]"
        }`}
      >
        {item.label.charAt(0)}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function DashboardSidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const pathname = usePathname();
  const session = useSession() ?? null;
  const [collapsed, setCollapsed] = useLocalFlag(COLLAPSE_KEY);

  function toggleCollapsed() {
    setCollapsed(!collapsed);
  }

  const sections = buildSections(session);

  const nav = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-6">
      {sections.map((section, i) => (
        <div key={i}>
          {section.label && !collapsed && section.items.length > 1 && (
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">{section.label}</p>
          )}
          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={pathname === item.href}
                onNavigate={onCloseMobile}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={toggleCollapsed}
        className="mt-auto hidden items-center justify-center rounded-lg border border-[#e6e8f0] py-2 text-[12px] font-semibold text-[#5b5f74] hover:bg-[#f0f1f5] lg:flex"
      >
        {collapsed ? "»" : "« Collapse"}
      </button>
    </nav>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className={`hidden shrink-0 border-r border-[#e6e8f0] bg-white lg:block ${collapsed ? "w-[76px]" : "w-64"}`}>
        {nav}
      </aside>

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/30" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">{nav}</aside>
        </div>
      )}
    </>
  );
}
