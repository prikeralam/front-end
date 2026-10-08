import Link from "next/link";
import { org, nav } from "../_content/org";

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/priresearch",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z",
  },
  {
    label: "Facebook",
    href: "",
    path: "M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.87.24-1.46 1.49-1.46H16.5V4.34C16.2 4.3 15.2 4.2 14 4.2c-2.4 0-4 1.46-4 4.15v2.15H7.5v3h2.5V21h3.5Z",
  },
  {
    label: "X",
    href: "",
    path: "M4 4h4.2l4 5.6L16.7 4H20l-6.3 7.9L20.3 20H16l-4.3-6-5 6H3.5l6.7-8.2L4 4Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/priresearch",
    path: "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm4 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.25 6.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  },
];

const footerColumns = [
  nav.find((n) => n.label === "About")!,
  nav.find((n) => n.label === "People")!,
  nav.find((n) => n.label === "Engage")!,
  {
    label: "Explore",
    items: [
      { label: "Research", href: "/research" },
      { label: "Projects", href: "/projects" },
      { label: "Data", href: "/data" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#12142b]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <span className="text-lg font-bold text-white">{org.name}</span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">{org.description}</p>
          </div>
          {footerColumns.map((n) => (
            <div key={n.label} className="text-sm">
              <p className="mb-3 font-semibold text-white/80">{n.label}</p>
              <ul className="space-y-2 text-white/55">
                {(n.items.length ? n.items : [{ label: n.label, href: n.href! }]).map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 text-sm text-white/55 sm:grid-cols-2">
          <div>{org.address.map((line) => <p key={line}>{line}</p>)}</div>
          <div>
            <p>{org.email}</p>
            <p>{org.phone}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-xs text-white/35">
          <span>Reg. No. {org.registration.regNo}</span>
          <span>12A: {org.registration.pan12A}</span>
          <span>80G: {org.registration.cert80G}</span>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-white/35">&copy; {new Date().getFullYear()} {org.name}.</p>
          <div className="flex items-center gap-6">
            <Link href="/account" className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55 transition-colors hover:text-white">
              Login
            </Link>
            {/* Facebook and X have no PRI profile yet; they show once their href is filled in. */}
            <div className="flex items-center gap-4">
              {socials.filter((s) => s.href).map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer" className="text-white/55 transition-colors hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
