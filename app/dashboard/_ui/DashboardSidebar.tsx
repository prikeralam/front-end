"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { getNavCountsAction, type NavCounts } from "../../_lib/dashboard/navActions";
import { canContributeContent, canReviewDrafts, isAdmin, sessionLabel, type Session } from "../../_lib/session";
import { useLocalFlag } from "../../_lib/useLocalFlag";
import { useSession } from "../../_lib/useSession";
import { AdminIcon, ChevronIcon, CollapseIcon, ContentIcon, DataIcon, EngageIcon, InboxIcon, OverviewIcon, PeopleIcon, ResearchIcon } from "./icons";

/** `badge` names a count from `NavCounts` shown beside the item (e.g. new messages). */
type NavItem = { label: string; href: string; badge?: keyof NavCounts };
type NavSection = { key: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; items: NavItem[]; also?: (path: string) => boolean };

const COLLAPSE_KEY = "pri_sidebar_collapsed";
const monoFont = "font-[family-name:var(--font-mono)]";

/** Top-level headers; a header with one destination is a plain link, the rest open to show their pages. */
function buildSections(session: Session | null): NavSection[] {
  const sections: NavSection[] = [{ key: "overview", label: "Overview", icon: OverviewIcon, items: [{ label: "Overview", href: "/dashboard" }] }];
  if (canReviewDrafts(session)) {
    sections.push({
      key: "inbox",
      label: "Inbox",
      icon: InboxIcon,
      items: [
        { label: "Messages", href: "/dashboard/inbox", badge: "messages" },
        { label: "Applications", href: "/dashboard/applications", badge: "applications" },
      ],
    });
  }

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
        key: "engage",
        label: "Engage",
        icon: EngageIcon,
        items: [
          { label: "Events & campaigns", href: "/dashboard/engage/events" },
          { label: "Job openings", href: "/dashboard/engage/jobs" },
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
        { label: "Visitors", href: "/dashboard/visitors", badge: "newVisitors" },
        { label: "Users & roles", href: "/dashboard/users" },
        { label: "Audit log", href: "/dashboard/audit" },
      ],
    });
  }
  return sections;
}

const isActiveSection = (section: NavSection, path: string) => section.items.some((item) => item.href === path) || !!section.also?.(path);

function Count({ n }: { n?: number }) {
  if (!n) return null;
  return <span className={`${monoFont} ml-auto rounded-full bg-[#4c6ef5] px-1.5 text-[10.5px] font-semibold leading-[18px] text-white`}>{n > 99 ? "99+" : n}</span>;
}

/**
 * The console's navigation: a deep-navy rail with the PRI mark, grouped sections that open to their pages, count
 * badges (new messages, applications, visitors this week) and the signed-in person at the foot. Collapses to icons.
 */
export default function DashboardSidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const pathname = usePathname();
  const session = useSession() ?? null;
  const [collapsed, setCollapsed] = useLocalFlag(COLLAPSE_KEY);
  // The header the user opened, remembered only for the page it was opened on: navigating opens the new page's header.
  const [manual, setManual] = useState<{ path: string; key: string | null } | null>(null);
  const [counts, setCounts] = useState<NavCounts>({});

  // Refreshed on each page change, so a handled message or a new sign-up shows as staff move around.
  useEffect(() => {
    let current = true;
    getNavCountsAction()
      .catch((): NavCounts => ({}))
      .then((next) => {
        if (current) setCounts(next);
      });
    return () => {
      current = false;
    };
  }, [pathname]);

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

  const renderNav = (rail: boolean) => (
    <nav aria-label="Dashboard" className="flex h-full flex-col px-3 pb-4 pt-4">
      <Link href="/dashboard" onClick={onCloseMobile} className={`mb-5 flex items-center gap-2.5 px-1.5 ${rail ? "justify-center" : ""}`}>
        <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#253d9a] font-[family-name:var(--font-heading)] text-[11px] tracking-wide text-white ring-1 ring-white/15">
          PRI
        </span>
        {!rail && (
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13.5px] font-semibold text-white">PRI Console</span>
            <span className="block truncate text-[11px] text-white/45">Policy and Research Initiative</span>
          </span>
        )}
      </Link>

      <ul className="flex-1 space-y-1.5 overflow-y-auto [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = section.key === activeKey;
          const single = section.items.length === 1;
          const open = !rail && openKey === section.key;
          const total = section.items.reduce((sum, item) => sum + (item.badge ? counts[item.badge] ?? 0 : 0), 0);
          const headerClass = `group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13.5px] font-medium transition-colors ${
            rail ? "justify-center" : ""
          } ${active && (single || rail) ? "bg-white/10 text-white" : active ? "text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"}`;
          const icon = <Icon className={`shrink-0 ${active ? "text-[#a9bbff]" : "text-white/45 group-hover:text-white/80"}`} />;

          return (
            <li key={section.key}>
              {single ? (
                <Link href={section.items[0].href} onClick={onCloseMobile} title={rail ? section.label : undefined} aria-current={active ? "page" : undefined} className={headerClass}>
                  {icon}
                  {!rail && <span className="truncate">{section.label}</span>}
                </Link>
              ) : (
                <>
                  <button type="button" onClick={() => toggle(section)} aria-expanded={open} title={rail ? section.label : undefined} className={headerClass}>
                    {icon}
                    {!rail ? (
                      <>
                        <span className="flex-1 truncate">{section.label}</span>
                        {!open && <Count n={total} />}
                        <ChevronIcon width={14} height={14} className={`shrink-0 text-white/35 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
                      </>
                    ) : (
                      total > 0 && <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#4c6ef5]" />
                    )}
                  </button>
                  {/* Grid-rows animates the height of the sub-list without measuring it. */}
                  <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden" inert={!open}>
                      <ul className="ml-[19px] mt-1 space-y-1 border-l border-nav-line pb-1.5 pl-2.5">
                        {section.items.map((item) => {
                          const current = item.href === pathname;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={onCloseMobile}
                                aria-current={current ? "page" : undefined}
                                className={`relative flex items-center rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                                  current ? "bg-white/10 font-semibold text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                {current && <span aria-hidden="true" className="absolute -left-[11.5px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[#a9bbff]" />}
                                {item.label}
                                {item.badge && <Count n={counts[item.badge]} />}
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

      {session && !rail && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-nav-line bg-white/[0.04] px-2.5 py-2">
          <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#a9bbff]/20 text-[11px] font-semibold text-[#d2dbff]">
            {(sessionLabel(session).name || session.email).slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            {sessionLabel(session).name && <span className="block truncate text-[12.5px] font-semibold text-white">{sessionLabel(session).name}</span>}
            <span className="block truncate text-[11.5px] text-white/50">{sessionLabel(session).role}</span>
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`mt-2 hidden items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-white/45 hover:bg-white/[0.06] hover:text-white lg:flex ${rail ? "justify-center" : ""}`}
      >
        <CollapseIcon className={collapsed ? "rotate-180" : ""} />
        {!rail && "Collapse"}
      </button>
    </nav>
  );

  return (
    <>
      <aside className={`sticky top-0 hidden h-[calc(100vh-73px)] shrink-0 bg-nav transition-[width] duration-200 lg:block ${collapsed ? "w-[68px]" : "w-60"}`}>
        {renderNav(collapsed)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-[#0b0e24]/50" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-nav shadow-xl">{renderNav(false)}</aside>
        </div>
      )}
    </>
  );
}
