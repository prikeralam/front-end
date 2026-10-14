import type { ReactNode, SVGProps } from "react";

/** Line icons for the dashboard, drawn on a 20px grid with a 1.6 stroke so they sit evenly beside 13–14px text. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width={18} height={18} {...props}>
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const OverviewIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="3" width="6" height="7" rx="1.5" />
    <rect x="11" y="3" width="6" height="4" rx="1.5" />
    <rect x="11" y="9" width="6" height="8" rx="1.5" />
    <rect x="3" y="12" width="6" height="5" rx="1.5" />
  </Icon>
);

export const ContentIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 2.75h6.5L15 6.25V17.25H5z" />
    <path d="M11.5 2.75v3.5H15M7.5 10h5M7.5 13h5" />
  </Icon>
);

export const PeopleIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="7.5" cy="7" r="2.75" />
    <path d="M2.75 16.5c.6-2.7 2.4-4.25 4.75-4.25s4.15 1.55 4.75 4.25" />
    <path d="M13 4.6a2.6 2.6 0 0 1 0 4.9M14.5 12.4c1.4.5 2.35 1.8 2.75 4.1" />
  </Icon>
);

export const ResearchIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 4.25c2.3-.9 4.6-.9 7 .75 2.4-1.65 4.7-1.65 7-.75v11.5c-2.3-.9-4.6-.9-7 .75-2.4-1.65-4.7-1.65-7-.75z" />
    <path d="M10 5v11.5" />
  </Icon>
);

export const DataIcon = (p: P) => (
  <Icon {...p}>
    <ellipse cx="10" cy="4.75" rx="6" ry="2.25" />
    <path d="M4 4.75v10.5c0 1.25 2.7 2.25 6 2.25s6-1 6-2.25V4.75M4 10c0 1.25 2.7 2.25 6 2.25s6-1 6-2.25" />
  </Icon>
);

export const InboxIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 11.5 5.2 4.6A1.5 1.5 0 0 1 6.6 3.5h6.8a1.5 1.5 0 0 1 1.4 1.1L17 11.5V15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15z" />
    <path d="M3 11.5h4l1 2h4l1-2h4" />
  </Icon>
);

export const AdminIcon = (p: P) => (
  <Icon {...p}>
    <path d="M10 2.5 16 5v4.6c0 3.7-2.5 6.4-6 7.9-3.5-1.5-6-4.2-6-7.9V5z" />
    <path d="m7.4 10 1.8 1.8 3.5-3.6" />
  </Icon>
);

export const ChevronIcon = (p: P) => (
  <Icon {...p}>
    <path d="m7.5 5 5 5-5 5" />
  </Icon>
);

export const PlusIcon = (p: P) => (
  <Icon {...p}>
    <path d="M10 4.5v11M4.5 10h11" />
  </Icon>
);

export const SearchIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="9" cy="9" r="5.25" />
    <path d="m13 13 3.75 3.75" />
  </Icon>
);

export const CloseIcon = (p: P) => (
  <Icon {...p}>
    <path d="m5 5 10 10M15 5 5 15" />
  </Icon>
);

export const ImageIcon = (p: P) => (
  <Icon {...p}>
    <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2" />
    <circle cx="7.25" cy="8" r="1.5" />
    <path d="m3.5 14.5 4-4 3 3 2.25-2.25 3.75 3.75" />
  </Icon>
);

export const UploadIcon = (p: P) => (
  <Icon {...p}>
    <path d="M10 13V3.5M6.25 7.25 10 3.5l3.75 3.75" />
    <path d="M3.5 12.5v2.25c0 .97.78 1.75 1.75 1.75h9.5c.97 0 1.75-.78 1.75-1.75V12.5" />
  </Icon>
);

export const CollapseIcon = (p: P) => (
  <Icon {...p}>
    <rect x="2.75" y="3.25" width="14.5" height="13.5" rx="2" />
    <path d="M7.75 3.25v13.5M13 8l-2 2 2 2" />
  </Icon>
);

export const MenuIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" />
  </Icon>
);

export const EngageIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="4.25" width="14" height="12.5" rx="2" />
    <path d="M3 8.25h14M7 2.75v3M13 2.75v3M7 11.75h2M11 11.75h2M7 14h2" />
  </Icon>
);

export const SignOutIcon = (p: P) => (
  <Icon {...p}>
    <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M12.5 13.5 16 10l-3.5-3.5M16 10H8" />
  </Icon>
);
