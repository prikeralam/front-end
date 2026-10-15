import type { Metadata } from "next";

// The page is a client component, so its title is set here.
export const metadata: Metadata = { title: "Audit log" };

export default function Layout({ children }: LayoutProps<"/dashboard/audit">) {
  return children;
}
