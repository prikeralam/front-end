"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";
import { canContributeContent, isAdmin, roleLabels, type Session } from "../../_lib/session";
import { useLocalFlag } from "../../_lib/useLocalFlag";
import { useSession } from "../../_lib/useSession";
import { AdminIcon, ChevronIcon, CollapseIcon, ContentIcon, DataIcon, OverviewIcon, PeopleIcon, ResearchIcon } from "./icons";

type NavItem = { label: string; href: string };
type NavSection = { key: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; items: NavItem[]; also?: (path: string) => boolean };

const COLLAPSE_KEY = "pri_sidebar_collapsed";

/** Six top-level headers; a header with one destination is a plain link, the rest open to show their pages. */
function buildSections(session: Session | null): NavSection[] {
  const sections: NavSection[] = [{ key: "overview", label: "Overview", icon: OverviewIcon, items: [{ label: "Overview", href: "/dashboard" }] }];

  if (canContributeContent(session)) {
    sections.push(
      {
        key: "content",
        label: "Content",
        icon: ContentIcon,
        items: [
          { label: "Pages & blocks", href: "/dashboard/content" },
          { label: "Testimonials", href: "/dashboard/content/testimonials" },
          { label: "Documents", href: "/dashboard/content/documents" },
          { label: "Cited in", href: "/dashboard/content/mentions" },
          { label: "Recognition", href: "/dashboard/content/recognition" },
        ],
      },
      {
        key: "people",
        label: "People",
        icon: PeopleIcon,
        items: [
          { label: "Team directory", href: "/dashboard/team" },
          { label: "Partners", href: "/dashboard/team/partners" },
        ],
      },
      {
        key: "research",
        label: "Research & Projects",
        icon: ResearchIcon,
        items: [
          { label: "Publications", href: "/dashboard/research" },
          { label: "Projects", href: "/dashboard/projects" },
        ],
      },
      {
        key: "data",
        label: "Data",
        icon: DataIcon,
        items: [
          { label: "Datasets", href: "/dashboard/manage" },
          { label: "Collections", href: "/dashboard/collections" },
        ],
        also: (path) => path.startsWith("/dashboard/theme/"),
      },
    );
  }

  if (isAdmin(session)) {
    sections.push({
      key: "admin",
      label: "Administration",
      icon: AdminIcon,
      items: [
        { label: "Users & roles", href: "/dashboard/users" },
        { label: "Audit log", href: "/dashboard/audit" },
      ],
    });
  }
  return sections;
}

const isActiveSection = (section: NavSection, path: string) => section.items.some((item) => item.href === path) || !!section.also?.(path);

export default function DashboardSidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const pathname = usePathname();
  const session = useSession() ?? null;
  const [collapsed, setCollapsed] = useLocalFlag(COLLAPSE_KEY);
  // The header the user opened, remembered only for the page it was opened on: navigating opens the new page's header.
  const [manual, setManual] = useState<{ path: string; key: string | null } | null>(null);

  const sections = buildSections(session);
  const activeKey = sections.find((s) => isActiveSection(s, pathname))?.key ?? null;
  const openKey = manual?.path === pathname ? manual.key : activeKey;

  function toggle(section: NavSection) {
    if (collapsed) {
      setCollapsed(false);
      setManual({ path: pathname, key: section.key });
      return;
    }
    setManual({ path: pathname, key: openKey === section.key ? null : section.key });
  }

  const renderNav = (railCollapsed: boolean) => (
    <nav aria-label="Dashboard" className="flex h-full flex-col px-3 pb-4 pt-5">
      {!railCollapsed && <p className="mb-3 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#7d86a8]">Workspace</p>}

      <ul className="flex-1 space-y-1 overflow-y-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = section.key === activeKey;
          const single = section.items.length === 1;
          const open = !railCollapsed && openKey === section.key;
          const headerClass = `group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] font-semibold transition-colors ${
            railCollapsed ? "justify-center" : ""
          } ${
            active && (single || railCollapsed)
              ? "bg-white text-[#253D9A] shadow-[0_1px_2px_rgba(23,26,43,0.08)]"
              : active
                ? "text-[#253D9A] hover:bg-white/60"
                : "text-[#3a4263] hover:bg-white/60 hover:text-[#171a2b]"
          }`;
          const icon = <Icon className={`shrink-0 ${active ? "text-[#253D9A]" : "text-[#6f7899] group-hover:text-[#3a4263]"}`} />;

          return (
            <li key={section.key}>
              {single ? (
                <Link href={section.items[0].href} onClick={onCloseMobile} title={railCollapsed ? section.label : undefined} aria-current={active ? "page" : undefined} className={headerClass}>
                  {icon}
                  {!railCollapsed && <span className="truncate">{section.label}</span>}
                </Link>
              ) : (
                <>
                  <button type="button" onClick={() => toggle(section)} aria-expanded={open} title={railCollapsed ? section.label : undefined} className={headerClass}>
                    {icon}
                    {!railCollapsed && (
                      <>
                        <span className="flex-1 truncate">{section.label}</span>
                        <ChevronIcon width={14} height={14} className={`shrink-0 text-[#8b93b3] transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
                      </>
                    )}
                  </button>
                  {/* Grid-rows animates the height of the sub-list without measuring it. */}
                  <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden" inert={!open}>
                      <ul className="relative ml-[21px] mt-1 space-y-0.5 border-l border-[#d3d9ec] pb-1 pl-3">
                        {section.items.map((item) => {
                          const current = item.href === pathname;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={onCloseMobile}
                                aria-current={current ? "page" : undefined}
                                className={`relative block rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                                  current ? "bg-white font-semibold text-[#253D9A] shadow-[0_1px_2px_rgba(23,26,43,0.08)]" : "text-[#4f5878] hover:bg-white/60 hover:text-[#171a2b]"
                                }`}
                              >
                                {current && <span aria-hidden="true" className="absolute -left-[13.5px] top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#253D9A]" />}
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {session && !railCollapsed && (
        <div className="mt-4 rounded-lg border border-[#d9def0] bg-white/70 px-3 py-2.5">
          <p className="truncate text-[13px] font-semibold text-[#171a2b]">{session.name}</p>
          <p className="text-[11.5px] text-[#6f7899]">{roleLabels[session.role]}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`mt-3 hidden items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium text-[#6f7899] hover:bg-white/60 hover:text-[#171a2b] lg:flex ${railCollapsed ? "justify-center" : ""}`}
      >
        <CollapseIcon className={collapsed ? "rotate-180" : ""} />
        {!railCollapsed && "Collapse"}
      </button>
    </nav>
  );

  return (
    <>
      <aside className={`sticky top-0 hidden h-[calc(100vh-73px)] shrink-0 border-r border-[#dde2f0] bg-[#eef1f9] transition-[width] duration-200 lg:block ${collapsed ? "w-[72px]" : "w-64"}`}>
        {renderNav(collapsed)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-[#171a2b]/40" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#eef1f9] shadow-xl">{renderNav(false)}</aside>
        </div>
      )}
    </>
  );
}
