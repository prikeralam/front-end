import type { Metadata } from "next";

// The page is a client component, so its title is set here.
export const metadata: Metadata = { title: "Applications" };

export default function Layout({ children }: LayoutProps<"/dashboard/applications">) {
  return children;
}
